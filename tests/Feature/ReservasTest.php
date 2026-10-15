<?php

use App\Mail\NuevaReserva;
use App\Models\Banner;
use App\Models\Reserva;
use App\Models\TipoReserva;
use App\Models\User;
use App\Services\ConfiguracionService;
use App\Services\ReservaService;
use Database\Seeders\ConfiguracionSeeder;
use Database\Seeders\ContenidoSeeder;
use Illuminate\Support\Facades\Mail;
use Illuminate\Testing\Fluent\AssertableJson;

beforeEach(function () {
    $this->seed([ConfiguracionSeeder::class, ContenidoSeeder::class]);
    app(ConfiguracionService::class)->actualizar(['contacto_whatsapp' => '51987654321', 'notificaciones_email' => 'equipo@credigo.test']);
    $this->viaje = TipoReserva::where('slug', 'viaje')->firstOrFail();
});

/** Datos válidos de una reserva de viaje para mañana. */
function datosReserva(array $cambios = []): array
{
    return [
        'tipo_reserva_id' => TipoReserva::where('slug', 'viaje')->value('id'),
        'origen' => 'Plaza de Armas de Arequipa',
        'destino' => 'Aeropuerto Rodríguez Ballón',
        'fecha' => now(ReservaService::ZONA)->addDay()->toDateString(),
        'hora' => '09:30',
        'pasajeros' => 3,
        'nombre' => 'Rosa Quispe',
        'telefono' => '987 654 321',
        'comentario' => 'Llevo dos maletas.',
        'acepta_politica' => true,
        ...$cambios,
    ];
}

it('la página /reservar abre con sus tipos visibles y el día de hoy', function () {
    TipoReserva::create(['nombre' => 'Oculto', 'slug' => 'oculto', 'activo' => false]);

    $this->get('/reservar')->assertOk();
    paginaApi('reservar', fn (AssertableJson $page) => $page
        ->has('tipos', 1)
        ->where('tipos.0.slug', 'viaje')
        ->where('tipos.0.pide_ruta', true)
        ->missing('tipos.0.activo')
        ->where('hoy', now(ReservaService::ZONA)->toDateString())
        ->where('secciones', fn ($s) => collect($s)->has('reservar.hero'))
        ->etc());
    $this->get('/sitemap.xml')->assertSee(url('/reservar'), false);
});

it('guarda la reserva, avisa al equipo y devuelve el WhatsApp con la reserva escrita', function () {
    Mail::fake();

    $url = $this->postJson('/api/reservas', datosReserva())
        ->assertCreated()
        ->json('data.whatsapp_url');

    $reserva = Reserva::sole();
    expect($reserva->tipo)->toBe('Viaje')
        ->and($reserva->estado)->toBe('pendiente')
        ->and($reserva->pasajeros)->toBe(3)
        ->and($reserva->ip)->not->toBeNull();
    Mail::assertSent(NuevaReserva::class, fn ($correo) => $correo->hasTo('equipo@credigo.test'));

    expect($url)->toStartWith('https://wa.me/51987654321?text=');
    $texto = rawurldecode(str($url)->after('?text='));
    expect($texto)->toContain('reserva (Viaje)', 'Desde: Plaza de Armas de Arequipa', 'Hasta: Aeropuerto', 'a las 09:30', 'Pasajeros: 3', 'Rosa Quispe');
});

it('valida la reserva: ruta si el tipo la pide, fecha desde hoy y consentimiento', function () {
    $this->postJson('/api/reservas', [])->assertJsonValidationErrors(['tipo_reserva_id', 'fecha', 'nombre', 'telefono', 'acepta_politica']);

    $this->postJson('/api/reservas', datosReserva([
        'origen' => '', 'destino' => '',
        'fecha' => now(ReservaService::ZONA)->subDay()->toDateString(),
        'hora' => '25:00',
    ]))->assertJsonValidationErrors(['origen', 'destino', 'fecha' => 'anterior a hoy', 'hora']);

    // Un tipo oculto no se puede reservar
    $this->viaje->update(['activo' => false]);
    $this->postJson('/api/reservas', datosReserva())->assertJsonValidationErrors(['tipo_reserva_id' => 'ya no está disponible']);
    expect(Reserva::count())->toBe(0);
});

it('un tipo sin recorrido no pide ni guarda origen, destino ni pasajeros', function () {
    $cita = TipoReserva::create(['nombre' => 'Cita en oficina', 'slug' => 'cita', 'pide_ruta' => false]);

    $this->postJson('/api/reservas', datosReserva(['tipo_reserva_id' => $cita->id, 'origen' => '', 'destino' => '']))->assertCreated();

    expect(Reserva::sole()->only(['tipo', 'origen', 'destino', 'pasajeros']))
        ->toBe(['tipo' => 'Cita en oficina', 'origen' => null, 'destino' => null, 'pasajeros' => null]);
});

it('a un bot (campo trampa lleno) le responde igual pero no guarda nada', function () {
    Mail::fake();

    $this->postJson('/api/reservas', datosReserva(['website' => 'spam.com']))->assertCreated();

    expect(Reserva::count())->toBe(0);
    Mail::assertNothingSent();
});

it('el panel lista las reservas con filtros y conteos, cambia su estado y las elimina', function () {
    $this->actingAs(User::factory()->create());
    $pendiente = Reserva::create([...collect(datosReserva())->except('acepta_politica')->all(), 'tipo' => 'Viaje', 'estado' => 'pendiente']);
    Reserva::create([...collect(datosReserva(['nombre' => 'Luis Mamani']))->except('acepta_politica')->all(), 'tipo' => 'Viaje', 'estado' => 'confirmada']);

    $this->getJson('/api/admin/reservas?estado=pendiente&buscar=Rosa')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.nombre', 'Rosa Quispe')
        ->assertJsonPath('data.0.fecha', datosReserva()['fecha'])
        ->assertJsonMissingPath('data.0.ip')
        ->assertJsonPath('conteos.pendiente', 1)
        ->assertJsonPath('opciones.estados.confirmada', 'Confirmada')
        ->assertJsonPath('opciones.tipos.0.reservas_count', 2);

    $this->getJson('/api/admin/contadores')->assertJsonPath('data.reservas_pendientes', 1);

    $this->putJson("/api/admin/reservas/{$pendiente->id}", ['estado' => 'confirmada', 'notas' => 'Chofer Juan, auto ABC-123'])
        ->assertOk()
        ->assertJsonPath('data.estado', 'confirmada');
    $this->putJson("/api/admin/reservas/{$pendiente->id}", ['estado' => 'perdida'])->assertJsonValidationErrors('estado');

    $this->deleteJson("/api/admin/reservas/{$pendiente->id}")->assertOk();
    expect(Reserva::count())->toBe(1);
});

it('el panel administra los tipos: la dirección no cambia al renombrar y borrar uno conserva sus reservas', function () {
    $this->actingAs(User::factory()->create());

    $id = $this->postJson('/api/admin/reservas/tipos', ['nombre' => 'Viaje', 'pide_ruta' => true, 'orden' => 1, 'activo' => true])
        ->assertCreated()
        ->assertJsonPath('data.slug', 'viaje-2') // "viaje" ya existe
        ->json('data.id');

    $this->putJson("/api/admin/reservas/tipos/{$id}", ['nombre' => 'Traslado al aeropuerto', 'orden' => 1, 'activo' => true])
        ->assertOk()
        ->assertJsonPath('data.slug', 'viaje-2');

    $this->postJson('/api/reservas', datosReserva(['tipo_reserva_id' => $id]))->assertCreated();
    $this->deleteJson("/api/admin/reservas/tipos/{$id}")->assertOk();

    expect(Reserva::sole())->tipo_reserva_id->toBeNull()->tipo->toBe('Traslado al aeropuerto');
});

it('/whatsapp lleva al WhatsApp de la empresa con el mensaje; sin número, a Soporte', function () {
    $this->get('/whatsapp?texto=Hola, quiero reservar')->assertRedirect('https://wa.me/51987654321?text=Hola%2C%20quiero%20reservar');

    app(ConfiguracionService::class)->actualizar(['contacto_whatsapp' => null]);

    $this->get('/whatsapp')->assertRedirect(url('/soporte'));
});

it('un botón del banner sin texto no guarda su enlace', function () {
    $this->actingAs(User::factory()->create());

    $this->postJson('/api/admin/banners', [
        'titulo' => 'Tu próxima aventura', 'orden' => 0, 'activo' => true,
        'boton_texto' => 'Reservar viaje', 'boton_url' => '/reservar?tipo=viaje',
        'boton2_texto' => '', 'boton2_url' => '/whatsapp?texto=Hola',
    ])->assertCreated();

    expect(Banner::latest('id')->first()->only(['boton_url', 'boton2_url']))->toBe(['boton_url' => '/reservar?tipo=viaje', 'boton2_url' => null]);
});
