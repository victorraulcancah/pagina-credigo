<?php

use App\Mail\NuevaSolicitud;
use App\Models\Configuracion;
use App\Models\MensajeContacto;
use App\Models\User;
use App\Services\ConfiguracionService;
use Database\Seeders\ConfiguracionSeeder;
use Illuminate\Support\Facades\Mail;
use Illuminate\Testing\TestResponse;
use Inertia\Testing\AssertableInertia as Assert;

function enviarContacto(array $cambios = []): TestResponse
{
    return test()->post('/contacto', [
        'nombre' => 'Luis Quispe',
        'telefono' => '987654321',
        'mensaje' => 'Quiero información del plan.',
        'acepta_politica' => true,
        ...$cambios,
    ]);
}

function configurar(string $clave, ?string $valor): void
{
    Configuracion::updateOrCreate(['clave' => $clave], ['valor' => $valor]);
    app(ConfiguracionService::class)->limpiarCache();
}

beforeEach(function () {
    $this->seed(ConfiguracionSeeder::class);
    Mail::fake();
});

describe('avisos por correo', function () {
    it('avisa a los correos del equipo cuando llega una solicitud', function () {
        configurar('notificaciones_email', 'ventas@credigo.test, gerencia@credigo.test');

        enviarContacto()->assertSessionHasNoErrors();

        Mail::assertSent(NuevaSolicitud::class, fn ($mail) => $mail->hasTo('ventas@credigo.test') && $mail->hasTo('gerencia@credigo.test'));
    });

    it('si no hay correos configurados, avisa al correo de contacto', function () {
        enviarContacto();

        Mail::assertSent(NuevaSolicitud::class, fn ($mail) => $mail->hasTo('contacto@credigo.com'));
    });

    it('no avisa si el envío lo hizo un bot', function () {
        enviarContacto(['website' => 'http://spam.test']);

        Mail::assertNothingSent();
    });

    it('rechaza correos de aviso mal escritos y no los expone en el sitio público', function () {
        $this->actingAs(User::factory()->create())
            ->put('/admin/configuracion', ['notificaciones_email' => 'bien@credigo.test, mal-correo'])
            ->assertSessionHasErrors('notificaciones_email');

        configurar('notificaciones_email', 'interno@credigo.test');
        $this->get('/')->assertInertia(fn (Assert $page) => $page->missing('sitio.notificaciones_email'));
    });
});

describe('seguimiento de solicitudes', function () {
    beforeEach(function () {
        $this->asesor = User::factory()->create(['name' => 'Asesor Uno']);
        $this->actingAs($this->asesor);
    });

    it('guarda de dónde llegó la solicitud', function () {
        enviarContacto(['origen' => 'cotizador', 'asunto' => 'Cotización: CrediYango']);

        expect(MensajeContacto::sole())->origen->toBe('cotizador')->estado->toBe('nuevo');
    });

    it('cambia el estado, asigna un asesor y guarda notas', function () {
        enviarContacto();
        $mensaje = MensajeContacto::sole();

        $this->put("/admin/mensajes/{$mensaje->id}/seguimiento", [
            'estado' => 'contactado',
            'asignado_a' => $this->asesor->id,
            'notas' => 'Llamé el lunes.',
        ])->assertSessionHasNoErrors();

        expect($mensaje->fresh())
            ->estado->toBe('contactado')
            ->asignado_a->toBe($this->asesor->id)
            ->notas->toBe('Llamé el lunes.')
            ->leido_at->not->toBeNull();
    });

    it('filtra por estado y por asesor, con el conteo de cada estado', function () {
        MensajeContacto::create(['nombre' => 'A', 'telefono' => '987654321', 'mensaje' => 'x', 'estado' => 'nuevo']);
        MensajeContacto::create(['nombre' => 'B', 'telefono' => '987654321', 'mensaje' => 'x', 'estado' => 'inscrito', 'asignado_a' => $this->asesor->id]);
        MensajeContacto::create(['nombre' => 'C', 'telefono' => '987654321', 'mensaje' => 'x', 'estado' => 'inscrito']);

        $this->get('/admin/mensajes?estado=inscrito')->assertInertia(fn (Assert $page) => $page
            ->has('mensajes.data', 2)
            ->where('conteos.nuevo', 1)
            ->where('conteos.inscrito', 2));

        $this->get('/admin/mensajes?asignado=mios')->assertInertia(fn (Assert $page) => $page
            ->has('mensajes.data', 1)
            ->where('mensajes.data.0.nombre', 'B'));

        $this->get('/admin/mensajes?asignado=sin_asignar')->assertInertia(fn (Assert $page) => $page->has('mensajes.data', 2));
    });

    it('exporta las solicitudes a Excel', function () {
        enviarContacto();

        $respuesta = $this->get('/admin/mensajes/exportar?estado=nuevo');

        $respuesta->assertOk()->assertDownload('solicitudes-'.now()->format('Y-m-d').'.xlsx');
        expect($respuesta->headers->get('content-type'))->toContain('spreadsheetml');
    });
});

describe('SEO', function () {
    it('pone el título, la descripción y la vista previa en el HTML del servidor', function () {
        $html = $this->get('/nosotros')->assertOk()->getContent();

        expect($html)
            ->toContain('<title inertia>Nosotros - CrediGo</title>')
            ->toContain('property="og:title" content="Nosotros - CrediGo"')
            ->toContain('property="og:image"')
            ->not->toContain('noindex');
    });

    it('no indexa el login ni el panel', function () {
        expect($this->get('/login')->getContent())->toContain('noindex');
    });

    it('carga Google Analytics y el píxel solo en el sitio público y si están configurados', function () {
        expect($this->get('/')->getContent())->not->toContain('googletagmanager');

        configurar('analytics_ga4', 'G-ABC123XYZ');
        configurar('analytics_meta_pixel', '123456789012345');

        expect($this->get('/')->getContent())
            ->toContain('gtag/js?id=G-ABC123XYZ')
            ->toContain("fbq('init', '123456789012345')");

        expect($this->actingAs(User::factory()->create())->get('/admin')->getContent())->not->toContain('googletagmanager');
    });

    it('ignora IDs de analítica con formato inválido', function () {
        configurar('analytics_ga4', "G-1');alert(1);//");

        expect($this->get('/')->getContent())->not->toContain('googletagmanager');
    });

    it('genera sitemap.xml y robots.txt', function () {
        $this->get('/sitemap.xml')->assertOk()->assertSee('<loc>'.url('/cotizador').'</loc>', false);
        $this->get('/robots.txt')->assertOk()->assertSee('Disallow: /admin')->assertSee('Sitemap: '.url('/sitemap.xml'));
    });
});
