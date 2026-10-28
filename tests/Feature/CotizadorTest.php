<?php

use App\Models\GrupoOpcion;
use App\Models\MensajeContacto;
use App\Models\OpcionPlan;
use App\Models\Servicio;
use App\Models\User;
use Database\Seeders\ContenidoSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\Fluent\AssertableJson;

beforeEach(function () {
    $this->seed(ContenidoSeeder::class);
});

it('muestra solo los planes visibles que tienen opciones visibles', function () {
    // El seeder carga opciones para "Moto o auto por adjudicación" y "CrediYango", no para microfinanciamiento
    paginaApi('cotizador', fn (AssertableJson $page) => $page
        ->has('planes', 2)
        ->where('planes.1.titulo', 'CrediYango')
        ->where('planes.1.opciones.0.cuota', 100)
        ->where('planes.1.opciones.0.numero_cuotas', 200));

    OpcionPlan::query()->update(['activo' => false]);

    paginaApi('cotizador', fn (AssertableJson $page) => $page->has('planes', 0));
});

it('marca en las tarjetas los planes que se pueden cotizar', function () {
    paginaApi('servicios', fn (AssertableJson $page) => $page
        ->where('servicios.1.titulo', 'CrediYango')
        ->where('servicios.1.opciones_count', 1)
        ->where('servicios.2.opciones_count', 0));
});

it('la solicitud del cotizador llega a la bandeja de mensajes', function () {
    $this->post('/api/solicitudes', [
        'origen' => 'cotizador',
        'nombre' => 'Luis',
        'telefono' => '987654321',
        'asunto' => 'Cotización: CrediYango',
        'mensaje' => "Quiero cotizar: CrediYango — CrediYango.\nInicial: S/ 2,000",
        'acepta_politica' => true,
    ])->assertSuccessful();

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

    $this->post('/api/admin/cotizador/opciones', $datos)->assertSuccessful();
    $opcion = OpcionPlan::firstWhere('nombre', 'Celular Redmi');
    expect($opcion->frecuencia)->toBe('mensual');

    $this->put("/api/admin/cotizador/opciones/{$opcion->id}", [...$datos, 'cuota' => 120])->assertSuccessful();
    expect($opcion->fresh()->cuota)->toBe(120.0);

    $this->delete("/api/admin/cotizador/opciones/{$opcion->id}");
    expect(OpcionPlan::find($opcion->id))->toBeNull();
});

it('guarda la inicial en dólares y las cuotas en soles', function () {
    $this->actingAs(User::factory()->create());
    $plan = Servicio::firstWhere('titulo', 'Todo lo que tu unidad necesita');

    $this->post('/api/admin/cotizador/opciones', [
        'servicio_id' => $plan->id,
        'nombre' => 'KIA SOLUTO PLUS',
        'moneda' => 'PEN',
        'moneda_inicial' => 'USD',
        'inicial' => 2500,
        'cuota' => 380,
        'numero_cuotas' => 185,
        'frecuencia' => 'semanal',
        'orden' => 0,
        'activo' => true,
    ])->assertSuccessful()
        ->assertJsonPath('data.moneda', 'PEN')
        ->assertJsonPath('data.moneda_inicial', 'USD');

    expect(OpcionPlan::firstWhere('nombre', 'KIA SOLUTO PLUS')->moneda_inicial)->toBe('USD');

    $this->post('/api/admin/cotizador/opciones', [
        'servicio_id' => $plan->id, 'nombre' => 'Otra', 'moneda' => 'PEN', 'moneda_inicial' => 'EUR', 'frecuencia' => 'semanal', 'orden' => 0,
    ])->assertJsonValidationErrors('moneda_inicial');
});

it('exige el monto de la cuota si se indica el número de cuotas', function () {
    $this->actingAs(User::factory()->create());

    $this->post('/api/admin/cotizador/opciones', [
        'servicio_id' => Servicio::first()->id,
        'nombre' => 'Opción incompleta',
        'moneda' => 'PEN',
        'numero_cuotas' => 10,
        'frecuencia' => 'semanal',
        'orden' => 0,
    ])->assertJsonValidationErrors('cuota');
});

describe('secciones con logo en la lista de opciones', function () {
    beforeEach(function () {
        $this->actingAs(User::factory()->create());
        $this->plan = Servicio::firstWhere('titulo', 'Todo lo que tu unidad necesita');
    });

    it('crea una sección con su logo', function () {
        Storage::fake('public');

        $this->post('/api/admin/cotizador/grupos', [
            'servicio_id' => $this->plan->id,
            'titulo' => 'Descuentos con YANGO',
            'imagen' => UploadedFile::fake()->image('yango.png'),
            'orden' => 0,
        ])->assertSuccessful()
            ->assertJsonPath('data.titulo', 'Descuentos con YANGO')
            ->assertJsonMissingPath('data.imagen');

        $grupo = GrupoOpcion::sole();
        Storage::disk('public')->assertExists($grupo->imagen);
    });

    it('guarda una opción dentro de una sección y la página del plan trae secciones y opciones', function () {
        $grupo = GrupoOpcion::create(['servicio_id' => $this->plan->id, 'titulo' => 'Descuentos con INDRIVER', 'orden' => 0]);

        $this->post('/api/admin/cotizador/opciones', [
            'servicio_id' => $this->plan->id,
            'grupo_opcion_id' => $grupo->id,
            'nombre' => 'Auto · certificado 13k USD',
            'moneda' => 'PEN',
            'cuota' => 50,
            'frecuencia' => 'semanal',
            'orden' => 0,
            'activo' => true,
        ])->assertSuccessful()->assertJsonPath('data.grupo_opcion_id', $grupo->id);

        paginaApi("planes/{$this->plan->slug}", fn (AssertableJson $page) => $page
            ->where('servicio.grupos.0.titulo', 'Descuentos con INDRIVER')
            ->where('servicio.grupos.0.imagen_url', null)
            ->where('servicio.opciones.0.grupo_opcion_id', $grupo->id));
    });

    it('no acepta la sección de otro plan', function () {
        $otro = Servicio::where('id', '!=', $this->plan->id)->first();
        $ajena = GrupoOpcion::create(['servicio_id' => $otro->id, 'titulo' => 'Ajena', 'orden' => 0]);

        $this->post('/api/admin/cotizador/opciones', [
            'servicio_id' => $this->plan->id,
            'grupo_opcion_id' => $ajena->id,
            'nombre' => 'Opción',
            'moneda' => 'PEN',
            'frecuencia' => 'semanal',
            'orden' => 0,
        ])->assertJsonValidationErrors('grupo_opcion_id');
    });

    it('al eliminar la sección borra su logo y sus opciones quedan sueltas', function () {
        Storage::fake('public');
        $grupo = GrupoOpcion::create(['servicio_id' => $this->plan->id, 'titulo' => 'Descuentos con YANGO', 'orden' => 0]);
        $this->post("/api/admin/cotizador/grupos/{$grupo->id}", ['_method' => 'put', 'servicio_id' => $this->plan->id, 'titulo' => 'Descuentos con YANGO', 'orden' => 0, 'imagen' => UploadedFile::fake()->image('yango.png')])
            ->assertSuccessful();
        $ruta = $grupo->fresh()->imagen;
        $opcion = OpcionPlan::create(['servicio_id' => $this->plan->id, 'grupo_opcion_id' => $grupo->id, 'nombre' => 'Opción', 'moneda' => 'PEN', 'frecuencia' => 'semanal', 'orden' => 0]);

        $this->delete("/api/admin/cotizador/grupos/{$grupo->id}")->assertSuccessful();

        Storage::disk('public')->assertMissing($ruta);
        expect(GrupoOpcion::count())->toBe(0)->and($opcion->fresh()->grupo_opcion_id)->toBeNull();
    });

    it('el panel lista las secciones junto a cada plan', function () {
        GrupoOpcion::create(['servicio_id' => $this->plan->id, 'titulo' => 'Descuentos con YANGO', 'orden' => 0]);

        $plan = collect($this->getJson('/api/admin/cotizador')->assertOk()->json('data.planes'))->firstWhere('id', $this->plan->id);

        expect($plan['grupos'])->toHaveCount(1)->and($plan['grupos'][0]['titulo'])->toBe('Descuentos con YANGO');
    });
});
