<?php

use App\Models\Seccion;
use App\Models\User;
use Database\Seeders\ConfiguracionSeeder;
use Database\Seeders\ContenidoSeeder;
use Illuminate\Support\Facades\Http;

/** Respuesta del ERP (GET /api/app/niveles-fidelizacion) con los 4 niveles de hoy, a propósito fuera de orden. */
function simularNivelesErp(?int $estado = null): void
{
    $nivel = fn (string $codigo, string $nombre, int $financiamientos, array $porcentajes = [], ?string $imagen = null) => [
        'codigo' => $codigo, 'nombre' => $nombre, 'imagen' => $imagen, 'imagen_url' => null,
        'financiamientos_requeridos' => $financiamientos, 'orden' => 1, 'porcentajes' => $porcentajes,
    ];

    Http::fake([
        '*/api/app/niveles-fidelizacion' => $estado
            ? Http::response(['message' => 'error'], $estado)
            : Http::response(['success' => true, 'data' => [
                $nivel('oro', 'Oro', 9, ['taller' => 10, 'celular' => 20]),
                $nivel('pollito', 'Pollito', 0, ['taller' => 30, 'celular' => 40], 'niveles/pollito.png'),
                $nivel('plata', 'Plata', 6, ['taller' => 20, 'celular' => 30]),
                $nivel('bronce', 'Bronce', 3, ['taller' => 30, 'celular' => 40]),
            ]]),
    ]);
}

beforeEach(function () {
    $this->seed([ConfiguracionSeeder::class, ContenidoSeeder::class]);
    config(['services.erp.url' => 'https://erp.test']);
});

function itemsDe(string $clave, string $pagina = 'inicio'): array
{
    return test()->getJson("/api/paginas/{$pagina}")->assertOk()->json('data.secciones')[$clave]['items'];
}

it('los niveles del inicio salen del ERP, en orden, con sus números y la descripción que escribió el panel', function () {
    simularNivelesErp();

    $niveles = itemsDe('general.beneficios');

    expect(array_column($niveles, 'titulo'))->toBe(['Pollito', 'Bronce', 'Plata', 'Oro'])
        ->and(array_column($niveles, 'financiamientos'))->toBe([0, 3, 6, 9])
        ->and($niveles[1]['porcentajes'])->toEqual(['taller' => 30, 'celular' => 40])
        // Pollito no está en el panel: sale sin descripción; los demás conservan la que se escribió allí
        ->and($niveles[0]['descripcion'])->toBeNull()
        ->and($niveles[1]['descripcion'])->toContain('programa de fidelización')
        ->and($niveles[1]['icono'])->toBe('Medal')
        // La imagen la guarda el ERP: se arma su dirección pública
        ->and($niveles[0]['imagen_url'])->toBe('https://erp.test/storage/niveles/pollito.png')
        ->and($niveles[1]['imagen_url'])->toBeNull();
});

it('la página de beneficios también usa los niveles del ERP', function () {
    simularNivelesErp();

    $niveles = itemsDe('beneficios.niveles', 'beneficios');

    expect(array_column($niveles, 'titulo'))->toBe(['Pollito', 'Bronce', 'Plata', 'Oro'])
        ->and($niveles[3]['financiamientos'])->toBe(9);
});

it('lo escrito en el panel para un nivel que ya no existe en el ERP no se muestra', function () {
    simularNivelesErp();
    $seccion = Seccion::where('pagina', 'general')->where('clave', 'beneficios')->sole();
    $seccion->update(['items' => [...$seccion->items, ['titulo' => 'Diamante', 'descripcion' => 'Ya no existe', 'icono' => 'Gem']]]);

    expect(array_column(itemsDe('general.beneficios'), 'titulo'))->not->toContain('Diamante');
});

it('si el ERP no responde se muestra lo que está escrito en el panel', function () {
    simularNivelesErp(500);

    $niveles = itemsDe('general.beneficios');

    expect(array_column($niveles, 'titulo'))->toBe(['Bronce', 'Plata', 'Oro'])
        ->and($niveles[0])->not->toHaveKey('financiamientos');
});

it('el panel recibe los niveles del ERP solo en las secciones de niveles', function () {
    simularNivelesErp();
    $this->actingAs(User::factory()->create());

    $niveles = Seccion::where('pagina', 'general')->where('clave', 'beneficios')->sole();
    $this->getJson("/api/admin/secciones/{$niveles->id}")->assertOk()
        ->assertJsonCount(4, 'data.niveles_erp')
        ->assertJsonPath('data.niveles_erp.0.nombre', 'Pollito')
        // Lo que ya estaba escrito sigue viniendo para rellenar el formulario
        ->assertJsonCount(3, 'data.items');

    $otra = Seccion::where('pagina', 'general')->where('clave', 'faq')->sole();
    $this->getJson("/api/admin/secciones/{$otra->id}")->assertOk()->assertJsonPath('data.niveles_erp', null);
});

it('guardar la sección con los niveles del ERP conserva sus descripciones', function () {
    simularNivelesErp();
    $this->actingAs(User::factory()->create());
    $seccion = Seccion::where('pagina', 'general')->where('clave', 'beneficios')->sole();

    $this->putJson("/api/admin/secciones/{$seccion->id}", [
        'titulo' => $seccion->titulo,
        'items' => [
            ['titulo' => 'Pollito', 'descripcion' => 'Para empezar', 'icono' => 'Medal'],
            ['titulo' => 'Bronce', 'descripcion' => 'Con acceso a cupones', 'icono' => null],
        ],
        'activo' => true,
    ])->assertOk();

    $niveles = itemsDe('general.beneficios');

    expect($niveles[0]['descripcion'])->toBe('Para empezar')
        ->and($niveles[1]['descripcion'])->toBe('Con acceso a cupones')
        // Plata y Oro siguen viniendo del ERP aunque ya no tengan texto en el panel
        ->and(array_column($niveles, 'titulo'))->toBe(['Pollito', 'Bronce', 'Plata', 'Oro'])
        ->and($niveles[2]['descripcion'])->toBeNull();
});
