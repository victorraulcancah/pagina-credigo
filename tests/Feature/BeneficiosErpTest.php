<?php

use App\Models\OpcionPlan;
use App\Models\Servicio;
use App\Models\User;
use App\Services\Erp\PlanesErp;
use Database\Seeders\ConfiguracionSeeder;
use Database\Seeders\ContenidoSeeder;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\Fluent\AssertableJson;

/** Respuestas del ERP para comercios, cupones y planes (con datos que la web NO debe mostrar). */
function simularCatalogosErp(array &$precios): void
{
    Http::fake(function (Request $request) use (&$precios) {
        $url = $request->url();

        if (str_contains($url, '/comercios-list')) {
            return Http::response(['success' => true, 'data' => [[
                'id' => 3,
                'numero_documento' => '10456789012',
                'razon_social' => 'Juan Pérez',
                'nombre_comercial' => 'Pollería Don Pepe',
                'email' => 'juan@example.com',
                'telefono' => '987654321',
                'logo' => 'comercios/pepe.png',
                'categoria' => ['id' => 1, 'nombre' => 'Restaurantes y Comida', 'icono' => 'Utensils'],
                'whatsapp_url' => 'https://wa.me/987654321',
                'activo' => true,
                'ubicaciones' => [['departamento_id' => 4, 'distrito_nombre' => 'CAYMA', 'direccion' => 'Av. 1', 'es_principal' => true]],
            ]]]);
        }

        if (str_contains($url, '/cupones/listar')) {
            $cupon = fn (array $cambios) => [
                'titulo' => 'Cupón', 'tipo_cupon' => 'publico', 'activo' => true, 'tipo_descuento' => 'porcentaje', 'valor' => '20.00',
                'fecha_inicio' => now()->subDay()->toIso8601String(), 'fecha_fin' => now()->addMonth()->toIso8601String(),
                'firma_contrato' => ['contrato_url' => 'https://erp.test/contrato.pdf'], ...$cambios,
            ];

            return Http::response(['success' => true, 'data' => ['cupones' => [
                $cupon(['id' => 1, 'titulo' => 'Vigente']),
                $cupon(['id' => 2, 'titulo' => 'Vencido', 'fecha_fin' => now()->subDays(2)->toIso8601String()]),
                $cupon(['id' => 3, 'titulo' => 'Futuro', 'fecha_inicio' => now()->addWeek()->toIso8601String()]),
                $cupon(['id' => 4, 'titulo' => 'Exclusivo', 'tipo_cupon' => 'exclusivo']),
            ], 'total' => 4]]);
        }

        if (str_contains($url, '/promociones/beneficios')) {
            return Http::response(['success' => true, 'data' => [[
                'id' => 12,
                'nombre' => 'Credi Motos',
                'disponible' => true,
                'categoria_nombre' => 'Motos',
                'grupo_financiamiento' => ['monto_comision' => 500, 'tasa_interes' => 30],
                'variantes_disponibles' => [[
                    'variante_id' => 7, 'nombre' => 'Certificado 5,500', 'certificado' => 5500.0, 'monto_cuota' => $precios['cuota'],
                    'cantidad_cuotas' => 58, 'cuota_inicial' => 0.0, 'monto_inscripcion' => 150.0, 'tasa_interes' => 21.3,
                    'frecuencia_pago_id' => 1, 'moneda_id' => 1, 'moneda_inicial_id' => 1,
                ]],
            ]]]);
        }

        return Http::response(['success' => true, 'data' => []]);
    });
}

beforeEach(function () {
    $this->seed([ConfiguracionSeeder::class, ContenidoSeeder::class]);
    config(['services.erp.url' => 'https://erp.test', 'services.erp.storage_url' => '']);
    Cache::flush();
});

it('muestra puntaje, niveles, cupones públicos vigentes y comercios sin datos privados', function () {
    $precios = ['cuota' => 130.0];
    simularCatalogosErp($precios);

    paginaApi('beneficios', fn (AssertableJson $page) => $page
        ->where('secciones', fn ($s) => collect(['hero', 'puntaje', 'rangos', 'niveles'])->every(fn ($c) => collect($s)->has("beneficios.{$c}")))
        ->has('cupones', 1)
        ->where('cupones.0.titulo', 'Vigente')
        ->where('cupones.0.valor', 20)
        ->missing('cupones.0.firma_contrato')
        ->has('comercios', 1)
        ->where('comercios.0.nombre', 'Pollería Don Pepe')
        ->where('comercios.0.categoria.nombre', 'Restaurantes y Comida')
        ->where('comercios.0.ciudades', ['Arequipa'])
        ->missing('comercios.0.numero_documento')
        ->missing('comercios.0.razon_social')
        ->missing('comercios.0.email'));

    // Nunca se pide la lista de cupones de un cliente
    Http::assertNotSent(fn (Request $request) => str_contains($request->url(), 'cliente_conductor_id'));
});

it('muestra la semana del conductor con la cuota semanal más baja en soles', function () {
    $precios = ['cuota' => 130.0];
    simularCatalogosErp($precios);
    OpcionPlan::query()->delete();
    $activo = Servicio::create(['titulo' => 'Credi Motos', 'descripcion' => 'Moto propia', 'activo' => true]);
    $inactivo = Servicio::create(['titulo' => 'Oculto', 'descripcion' => 'No visible', 'activo' => false]);
    $opcion = fn (Servicio $servicio, array $datos) => $servicio->opciones()->create(['nombre' => 'Opción', 'moneda' => 'PEN', 'frecuencia' => 'semanal', 'activo' => true, ...$datos]);
    $opcion($activo, ['cuota' => 120]);
    $opcion($activo, ['cuota' => 95]);
    $opcion($activo, ['cuota' => 40, 'moneda' => 'USD']);
    $opcion($activo, ['cuota' => 50, 'frecuencia' => 'mensual']);
    $opcion($activo, ['cuota' => 60, 'activo' => false]);
    $opcion($inactivo, ['cuota' => 70]);

    paginaApi('beneficios', fn (AssertableJson $page) => $page
        ->where('secciones', fn ($s) => collect($s)['beneficios.semana']['titulo'] === 'Tu semana con CrediGo')
        ->where('cuota_semanal.cuota', fn ($cuota) => (float) $cuota === 95.0)
        ->where('cuota_semanal.moneda', 'PEN'));

    // Ya no forma parte del inicio
    paginaApi('inicio', fn (AssertableJson $page) => $page
        ->where('secciones', fn ($s) => ! collect($s)->has('inicio.semana')));
});

it('el panel agrega una opción con los precios del ERP y la mantiene actualizada', function () {
    $precios = ['cuota' => 130.0];
    simularCatalogosErp($precios);
    $this->actingAs(User::factory()->create());
    $plan = Servicio::firstOrFail();

    $this->getJson('/api/admin/cotizador')->assertOk()
        ->assertJsonPath('data.erp.planes.0.opciones.0.ref', 'v7')
        ->assertJsonMissingPath('data.erp.planes.0.opciones.0.tasa_interes');

    $this->post('/api/admin/cotizador/opciones/erp', ['servicio_id' => $plan->id, 'erp_ref' => 'v7'])->assertSuccessful();

    $opcion = OpcionPlan::where('erp_ref', 'v7')->sole();
    expect($opcion)
        ->servicio_id->toBe($plan->id)
        ->cuota->toBe(130.0)
        ->numero_cuotas->toBe(58)
        ->inicial->toBe(150.0)
        ->frecuencia->toBe('semanal')
        ->and($opcion->nota)->toContain('Certificado de 5,500');

    // Cambia el precio en el ERP: la opción vinculada se actualiza sola
    $precios['cuota'] = 135.0;
    app(PlanesErp::class)->sincronizar();

    expect($opcion->fresh()->cuota)->toBe(135.0);
});

it('no agrega precios que el ERP ya no tiene ni permite inventar un vínculo', function () {
    $precios = ['cuota' => 130.0];
    simularCatalogosErp($precios);
    $this->actingAs(User::factory()->create());
    $plan = Servicio::firstOrFail();

    $this->post('/api/admin/cotizador/opciones/erp', ['servicio_id' => $plan->id, 'erp_ref' => 'v999'])->assertJsonValidationErrors('erp_ref');

    $this->post('/api/admin/cotizador/opciones', [
        'servicio_id' => $plan->id, 'erp_ref' => 'v7', 'nombre' => 'Manual', 'moneda' => 'PEN', 'frecuencia' => 'semanal', 'orden' => 0,
    ])->assertJsonValidationErrors('erp_ref');
});
