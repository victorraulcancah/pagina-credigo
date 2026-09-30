<?php

use App\Models\MensajeContacto;
use App\Models\Seccion;
use Database\Seeders\ConfiguracionSeeder;
use Database\Seeders\ContenidoSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed([ConfiguracionSeeder::class, ContenidoSeeder::class]);
});

it('muestra las páginas públicas con su contenido', function (string $url, string $componente) {
    $this->get($url)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component($componente)
            ->has('secciones')
            ->where('sitio.empresa_nombre', 'CrediGo'));
})->with([
    'inicio' => ['/', 'Web/Inicio'],
    'nosotros' => ['/nosotros', 'Web/Nosotros'],
    'servicios' => ['/servicios', 'Web/Servicios'],
    'requisitos' => ['/requisitos', 'Web/Requisitos'],
    'como pagar' => ['/como-pagar', 'Web/ComoPagar'],
    'soporte' => ['/soporte', 'Web/Contacto'],
]);

it('muestra los requisitos editables y enlaza a ellos desde "Cómo funciona"', function () {
    $this->get('/requisitos')->assertInertia(fn (Assert $page) => $page
        ->where('secciones', fn ($secciones) => collect(['hero', 'documentos', 'datos', 'proceso', 'empresas'])
            ->every(fn ($clave) => collect($secciones)->has("requisitos.{$clave}"))
            && count($secciones['requisitos.documentos']['items']) === 4));

    expect(Seccion::where('pagina', 'inicio')->where('clave', 'como_funciona')->sole())
        ->usaCampo('boton')->toBeTrue()
        ->boton_url->toBe('/requisitos');
});

it('muestra cómo pagar sin cuentas inventadas: se cargan desde el panel', function () {
    $this->get('/como-pagar')->assertInertia(fn (Assert $page) => $page
        ->where('secciones', fn ($secciones) => collect(['hero', 'medios', 'cuentas', 'aviso', 'despues', 'descuento'])
            ->every(fn ($clave) => collect($secciones)->has("pagos.{$clave}"))
            && $secciones['pagos.cuentas']['items'] === []));
});

it('redirige la antigua página de contacto a soporte', function () {
    $this->get('/contacto')->assertStatus(301)->assertRedirect('/soporte');
});

it('crea solo las secciones de las páginas pedidas (para migraciones)', function () {
    Seccion::query()->delete();

    ContenidoSeeder::crearSecciones(['requisitos']);

    expect(Seccion::pluck('pagina')->unique()->values()->all())->toBe(['requisitos'])
        ->and(Seccion::count())->toBe(5);
});

it('no envía al sitio las secciones desactivadas', function () {
    Seccion::where('pagina', 'nosotros')->where('clave', 'mision')->update(['activo' => false]);

    $this->get('/nosotros')->assertInertia(fn (Assert $page) => $page
        ->where('secciones', fn ($secciones) => ! collect($secciones)->has('nosotros.mision')
            && collect($secciones)->has('nosotros.vision')));
});

it('guarda el mensaje del formulario de contacto', function () {
    $this->post('/contacto', [
        'nombre' => 'Juan',
        'apellido' => 'Pérez',
        'email' => 'juan@example.com',
        'telefono' => '987 654 321',
        'tipo_consulta' => 'problema_app',
        'asunto' => 'No puedo entrar a la app',
        'mensaje' => 'Quiero información',
        'acepta_politica' => true,
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect(MensajeContacto::sole())
        ->nombre_completo->toBe('Juan Pérez')
        ->tipo_consulta_texto->toBe('Problema con la app')
        ->origen->toBe('contacto')
        ->leido_at->toBeNull();
});

it('valida el formulario de contacto (incluida la aceptación de la política)', function () {
    $this->post('/contacto', ['nombre' => '', 'telefono' => 'abc', 'tipo_consulta' => 'inventado', 'mensaje' => ''])
        ->assertSessionHasErrors(['nombre', 'apellido', 'email', 'telefono', 'tipo_consulta', 'asunto', 'mensaje', 'acepta_politica']);

    expect(MensajeContacto::count())->toBe(0);
});

it('descarta los envíos de bots (campo trampa lleno)', function () {
    $this->post('/contacto', [
        'nombre' => 'Bot',
        'telefono' => '999999999',
        'mensaje' => 'spam',
        'website' => 'http://spam.test',
        'acepta_politica' => true,
    ])->assertRedirect();

    expect(MensajeContacto::count())->toBe(0);
});

it('muestra las páginas legales', function (string $url) {
    $this->get($url)->assertOk()->assertInertia(fn (Assert $page) => $page->component('Web/Legal'));
})->with(['/terminos-y-condiciones', '/politica-de-privacidad']);
