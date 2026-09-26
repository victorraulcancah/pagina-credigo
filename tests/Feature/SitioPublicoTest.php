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
    'contacto' => ['/contacto', 'Web/Contacto'],
]);

it('no envía al sitio las secciones desactivadas', function () {
    Seccion::where('pagina', 'nosotros')->where('clave', 'mision')->update(['activo' => false]);

    $this->get('/nosotros')->assertInertia(fn (Assert $page) => $page
        ->where('secciones', fn ($secciones) => ! collect($secciones)->has('nosotros.mision')
            && collect($secciones)->has('nosotros.vision')));
});

it('guarda el mensaje del formulario de contacto', function () {
    $this->post('/contacto', [
        'nombre' => 'Juan Pérez',
        'telefono' => '987 654 321',
        'mensaje' => 'Quiero información',
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect(MensajeContacto::sole())
        ->nombre->toBe('Juan Pérez')
        ->leido_at->toBeNull();
});

it('valida el formulario de contacto', function () {
    $this->post('/contacto', ['nombre' => '', 'telefono' => 'abc', 'mensaje' => ''])
        ->assertSessionHasErrors(['nombre', 'telefono', 'mensaje']);

    expect(MensajeContacto::count())->toBe(0);
});

it('descarta los envíos de bots (campo trampa lleno)', function () {
    $this->post('/contacto', [
        'nombre' => 'Bot',
        'telefono' => '999999999',
        'mensaje' => 'spam',
        'website' => 'http://spam.test',
    ])->assertRedirect();

    expect(MensajeContacto::count())->toBe(0);
});
