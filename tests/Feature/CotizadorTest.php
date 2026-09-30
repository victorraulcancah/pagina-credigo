<?php

use App\Models\MensajeContacto;
use App\Models\OpcionPlan;
use App\Models\Servicio;
use App\Models\User;
use Database\Seeders\ContenidoSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(ContenidoSeeder::class);
});

it('muestra solo los planes visibles que tienen opciones visibles', function () {
    // El seeder carga opciones para "Moto o auto por adjudicación" y "CrediYango", no para microfinanciamiento
    $this->get('/cotizador')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Web/Cotizador')
        ->has('planes', 2)
        ->where('planes.1.titulo', 'CrediYango')
        ->where('planes.1.opciones.0.cuota', 100)
        ->where('planes.1.opciones.0.numero_cuotas', 200));

    OpcionPlan::query()->update(['activo' => false]);

    $this->get('/cotizador')->assertInertia(fn (Assert $page) => $page->has('planes', 0));
});

it('marca en las tarjetas los planes que se pueden cotizar', function () {
    $this->get('/servicios')->assertInertia(fn (Assert $page) => $page
        ->where('servicios.1.titulo', 'CrediYango')
        ->where('servicios.1.opciones_count', 1)
        ->where('servicios.2.opciones_count', 0));
});

it('la solicitud del cotizador llega a la bandeja de mensajes', function () {
    $this->post('/contacto', [
        'origen' => 'cotizador',
        'nombre' => 'Luis',
        'telefono' => '987654321',
        'asunto' => 'Cotización: CrediYango',
        'mensaje' => "Quiero cotizar: CrediYango — CrediYango.\nInicial: S/ 2,000",
        'acepta_politica' => true,
    ])->assertSessionHasNoErrors();

    expect(MensajeContacto::sole()->asunto)->toBe('Cotización: CrediYango');
});

it('el panel crea, edita y elimina opciones del cotizador', function () {
    $this->actingAs(User::factory()->create());
    $plan = Servicio::firstWhere('titulo', 'Todo lo que tu unidad necesita');

    $datos = [
        'servicio_id' => $plan->id,
        'nombre' => 'Celular Redmi',
        'moneda' => 'PEN',
        'inicial' => 300,
        'cuota' => 100,
        'numero_cuotas' => 6,
        'frecuencia' => 'mensual',
        'orden' => 0,
        'activo' => true,
    ];

    $this->post('/admin/cotizador/opciones', $datos)->assertSessionHasNoErrors();
    $opcion = OpcionPlan::firstWhere('nombre', 'Celular Redmi');
    expect($opcion->frecuencia)->toBe('mensual');

    $this->put("/admin/cotizador/opciones/{$opcion->id}", [...$datos, 'cuota' => 120])->assertSessionHasNoErrors();
    expect($opcion->fresh()->cuota)->toBe(120.0);

    $this->delete("/admin/cotizador/opciones/{$opcion->id}");
    expect(OpcionPlan::find($opcion->id))->toBeNull();
});

it('exige el monto de la cuota si se indica el número de cuotas', function () {
    $this->actingAs(User::factory()->create());

    $this->post('/admin/cotizador/opciones', [
        'servicio_id' => Servicio::first()->id,
        'nombre' => 'Opción incompleta',
        'moneda' => 'PEN',
        'numero_cuotas' => 10,
        'frecuencia' => 'semanal',
        'orden' => 0,
    ])->assertSessionHasErrors('cuota');
});
