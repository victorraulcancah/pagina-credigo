<?php

use App\Models\User;
use App\Services\Erp\TalleresErp;
use Database\Seeders\ConfiguracionSeeder;
use Database\Seeders\ContenidoSeeder;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

/** Taller tal como lo devuelve el listado del ERP (incluye datos que la web NO debe mostrar). */
function tallerErp(array $cambios = []): array
{
    return [
        'id' => 7,
        'tipo_documento' => 'RUC',
        'numero_documento' => '20123456789',
        'razon_social' => 'TALLER SAC',
        'nombre_comercial' => 'Automotriz Prueba',
        'telefono' => '987654321',
        'email' => 'dueno@example.com',
        'logo' => 'talleres/logo.png',
        'direccion' => 'Av. Principal 123',
        'google_maps_url' => 'https://maps.app.goo.gl/abc',
        'departamento_id' => 4,
        'promedio_calificacion' => 4.56,
        'total_calificaciones' => 9,
        'activo' => true,
        'whatsapp_url' => 'https://wa.me/987654321',
        'ubicaciones' => [],
        ...$cambios,
    ];
}

function detalleTallerErp(): array
{
    return [
        ...tallerErp(),
        'horario_atencion' => ['lunes' => ['apertura' => '08:00', 'cierre' => '18:00', 'cerrado' => false]],
        'ubicaciones' => [[
            'departamento_id' => 15,
            'provincia_nombre' => 'LIMA',
            'distrito_nombre' => 'SAN BORJA',
            'direccion' => 'Calle 1',
            'google_maps_url' => 'javascript:alert(1)',
            'es_principal' => true,
        ]],
        'servicios' => [
            [
                'id' => 1,
                'nombre' => 'LLANTAS',
                'descripcion' => 'Detalle del servicio',
                'imagen' => 'beneficios/llantas.png',
                'disponible' => true,
                'detalle_financiamiento' => [
                    'moneda' => 'S/.',
                    'porcentaje_inicial_default' => 30,
                    'min_cuotas' => 2,
                    'max_cuotas' => 4,
                    'frecuencia_pago_default' => 'semanal',
                    'tasa_interes' => 10,
                    'contrato' => ['url' => 'https://erp.test/contrato.pdf'],
                    'fijo' => ['cuota_inicial' => 120.61, 'cuota_mensual' => 40.2, 'cantidad_cuotas' => 3, 'monto_total_estimado' => 241.21],
                ],
            ],
            ['id' => 2, 'nombre' => 'NO DISPONIBLE', 'disponible' => false, 'detalle_financiamiento' => []],
        ],
    ];
}

/** Simula el ERP; con $caido = true responde error 500. */
function simularErp(bool &$caido): void
{
    Http::fake(function (Request $request) use (&$caido) {
        if ($caido) {
            return Http::response('Error', 500);
        }

        return str_contains($request->url(), '/servicios/')
            ? Http::response(['success' => true, 'data' => detalleTallerErp()])
            : Http::response(['success' => true, 'data' => [tallerErp()]]);
    });
}

beforeEach(function () {
    $this->seed([ConfiguracionSeeder::class, ContenidoSeeder::class]);
    config(['services.erp.url' => 'https://erp.test', 'services.erp.storage_url' => '']);
    Cache::flush();
});

it('muestra los talleres del ERP solo con los datos públicos', function () {
    $caido = false;
    simularErp($caido);

    $this->get('/talleres')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Web/Talleres')
        ->has('talleres', 1)
        ->where('talleres.0.nombre', 'Automotriz Prueba')
        ->where('talleres.0.logo_url', 'https://erp.test/storage/talleres/logo.png')
        ->where('talleres.0.calificacion', 4.6)
        ->where('talleres.0.ciudades', ['Lima'])
        ->where('talleres.0.ubicaciones.0.distrito', 'San Borja')
        ->where('talleres.0.ubicaciones.0.mapa_url', null)
        ->where('talleres.0.horario.lunes.apertura', '08:00')
        ->has('talleres.0.servicios', 1)
        ->where('talleres.0.servicios.0.moneda', 'S/')
        ->where('talleres.0.servicios.0.precio.cuotas', 3)
        ->missing('talleres.0.numero_documento')
        ->missing('talleres.0.email')
        ->missing('talleres.0.telefono')
        ->missing('talleres.0.servicios.0.detalle_financiamiento'));
});

it('sigue mostrando la última copia si el ERP no responde', function () {
    $caido = false;
    simularErp($caido);
    app(TalleresErp::class)->sincronizar();

    $caido = true;
    $this->travel(31)->minutes();

    $this->get('/talleres')->assertInertia(fn (Assert $page) => $page->has('talleres', 1));
});

it('funciona sin ERP configurado y no llama a nadie', function () {
    config(['services.erp.url' => '']);
    Http::fake();

    $this->get('/talleres')->assertOk()->assertInertia(fn (Assert $page) => $page->where('talleres', []));

    Http::assertNothingSent();
});

it('el panel muestra el estado del ERP y actualiza la copia a pedido', function () {
    $caido = false;
    simularErp($caido);
    $this->actingAs(User::factory()->create());

    $this->getJson('/api/admin/dashboard')->assertOk()
        ->assertJsonPath('data.erp.configurado', true)
        ->assertJsonPath('data.erp.catalogos.talleres.cantidad', 1);

    $this->post('/api/admin/erp/sincronizar')->assertOk()->assertJsonPath('data.catalogos.talleres.cantidad', 1);

    // Si el ERP no responde, avisa cuál falló y se sigue mostrando la última copia
    $caido = true;
    $this->post('/api/admin/erp/sincronizar')->assertStatus(502)->assertJsonPath('success', false);
    expect(app(TalleresErp::class)->items())->toHaveCount(1);
});

it('solo el panel puede forzar la actualización', function () {
    $this->postJson('/api/admin/erp/sincronizar')->assertUnauthorized();
});
