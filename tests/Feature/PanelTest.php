<?php

use App\Models\Configuracion;
use App\Models\MensajeContacto;
use App\Models\Seccion;
use App\Models\Servicio;
use App\Models\User;
use Database\Seeders\ContenidoSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('redirige al login si no hay sesión', function () {
    $this->get('/admin')->assertRedirect('/login');
});

it('inicia sesión y entra al panel', function () {
    $user = User::factory()->create(['password' => 'secreto123']);

    $this->post('/login', ['email' => $user->email, 'password' => 'secreto123'])
        ->assertRedirect('/admin');

    $this->assertAuthenticatedAs($user);
});

it('rechaza credenciales incorrectas', function () {
    $user = User::factory()->create();

    $this->post('/login', ['email' => $user->email, 'password' => 'incorrecta'])
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

describe('con sesión iniciada', function () {
    beforeEach(function () {
        $this->actingAs(User::factory()->create());
    });

    it('abre las pantallas del panel', function (string $url, string $componente) {
        $this->seed(ContenidoSeeder::class);

        $this->get($url)->assertOk()->assertInertia(fn (Assert $page) => $page->component($componente));
    })->with([
        ['/admin', 'Admin/Dashboard'],
        ['/admin/configuracion/empresa', 'Admin/Configuracion/Empresa'],
        ['/admin/configuracion/apariencia', 'Admin/Configuracion/Apariencia'],
        ['/admin/banners', 'Admin/Banners/Index'],
        ['/admin/secciones', 'Admin/Secciones/Index'],
        ['/admin/servicios', 'Admin/Servicios/Index'],
        ['/admin/preguntas', 'Admin/Preguntas/Index'],
        ['/admin/mensajes', 'Admin/Mensajes/Index'],
        ['/admin/perfil', 'Admin/Perfil'],
    ]);

    it('actualiza los colores y los comparte con el sitio', function () {
        $this->put('/admin/configuracion', ['color_primario' => '#112233', 'color_acento' => '#ffcc00'])
            ->assertSessionHasNoErrors();

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->where('sitio.color_primario', '#112233')
            ->where('sitio.color_acento', '#ffcc00'));
    });

    it('rechaza colores que no son hexadecimales', function () {
        $this->put('/admin/configuracion', ['color_primario' => 'red;}body{'])
            ->assertSessionHasErrors('color_primario');
    });

    it('extrae el enlace cuando pegan el iframe de Google Maps', function () {
        $iframe = '<iframe src="https://www.google.com/maps/embed?pb=abc&amp;x=1" width="600"></iframe>';

        $this->put('/admin/configuracion', ['contacto_mapa_url' => $iframe])->assertSessionHasNoErrors();

        expect(Configuracion::where('clave', 'contacto_mapa_url')->value('valor'))
            ->toBe('https://www.google.com/maps/embed?pb=abc&x=1');
    });

    it('sube el logo y borra el anterior al reemplazarlo', function () {
        Storage::fake('public');

        $this->post('/admin/configuracion', ['_method' => 'put', 'logo' => UploadedFile::fake()->image('logo.png')]);
        $primero = Configuracion::where('clave', 'logo')->value('valor');

        $this->post('/admin/configuracion', ['_method' => 'put', 'logo' => UploadedFile::fake()->image('nuevo.png')]);
        $segundo = Configuracion::where('clave', 'logo')->value('valor');

        Storage::disk('public')->assertMissing($primero);
        Storage::disk('public')->assertExists($segundo);
    });

    it('crea, edita y elimina un servicio', function () {
        $datos = ['titulo' => 'Seguros', 'descripcion' => 'Seguro vehicular', 'icono' => 'ShieldCheck', 'orden' => 1, 'activo' => true, 'destacado' => false];

        $this->post('/admin/servicios', $datos)->assertSessionHasNoErrors();
        $servicio = Servicio::sole();

        $this->put("/admin/servicios/{$servicio->id}", [...$datos, 'titulo' => 'Seguros vehiculares'])->assertSessionHasNoErrors();
        expect($servicio->fresh()->titulo)->toBe('Seguros vehiculares');

        $this->delete("/admin/servicios/{$servicio->id}");
        expect(Servicio::count())->toBe(0);
    });

    it('edita una sección solo en los campos que tiene habilitados', function () {
        $this->seed(ContenidoSeeder::class);
        $seccion = Seccion::where('pagina', 'nosotros')->where('clave', 'valores')->sole();

        $this->put("/admin/secciones/{$seccion->id}", [
            'subtitulo' => 'Valores',
            'titulo' => 'Nuestros pilares',
            'contenido' => 'Este campo no aplica a la sección',
            'items' => [['titulo' => 'Honestidad', 'descripcion' => 'Siempre', 'icono' => 'Heart']],
            'activo' => true,
        ])->assertSessionHasNoErrors();

        $seccion->refresh();
        expect($seccion->titulo)->toBe('Nuestros pilares')
            ->and($seccion->items)->toHaveCount(1)
            ->and($seccion->contenido)->toBeNull();
    });

    it('vacía la lista de una sección cuando se quitan todos los elementos', function () {
        $this->seed(ContenidoSeeder::class);
        $seccion = Seccion::where('pagina', 'nosotros')->where('clave', 'valores')->sole();

        $this->put("/admin/secciones/{$seccion->id}", ['titulo' => 'Valores', 'activo' => true])->assertSessionHasNoErrors();

        expect($seccion->fresh()->items)->toBe([]);
    });

    it('pone imagen de fondo al encabezado de contacto y la muestra en la página', function () {
        Storage::fake('public');
        $this->seed(ContenidoSeeder::class);
        $seccion = Seccion::where('pagina', 'contacto')->where('clave', 'hero')->sole();

        $this->post("/admin/secciones/{$seccion->id}", [
            '_method' => 'put',
            'titulo' => 'Hablemos',
            'imagen' => UploadedFile::fake()->image('fondo.jpg', 1920, 700),
            'activo' => true,
        ])->assertSessionHasNoErrors();

        Storage::disk('public')->assertExists($seccion->fresh()->imagen);

        $this->get('/contacto')->assertInertia(fn (Assert $page) => $page
            ->where('secciones', fn ($secciones) => str_contains($secciones['contacto.hero']['imagen_url'] ?? '', '/storage/secciones/')));
    });

    it('marca un mensaje como leído y como no leído', function () {
        $mensaje = MensajeContacto::create(['nombre' => 'Ana', 'telefono' => '987654321', 'mensaje' => 'Hola']);

        $this->patch("/admin/mensajes/{$mensaje->id}/leido", ['leido' => true]);
        expect($mensaje->fresh()->leido_at)->not->toBeNull();

        $this->patch("/admin/mensajes/{$mensaje->id}/leido", ['leido' => false]);
        expect($mensaje->fresh()->leido_at)->toBeNull();
    });
});
