<?php

use App\Models\Sede;
use App\Models\User;
use Database\Seeders\ConfiguracionSeeder;
use Database\Seeders\ContenidoSeeder;

beforeEach(function () {
    $this->seed([ConfiguracionSeeder::class, ContenidoSeeder::class]);
});

it('el sitio entrega solo las sedes visibles, en orden', function () {
    Sede::create(['ciudad' => 'Lima', 'direccion' => 'Av. Lima 123', 'orden' => 1]);
    Sede::create(['ciudad' => 'Arequipa', 'direccion' => 'Av. Arequipa 1', 'telefono' => '993 570 000', 'mapa_url' => 'https://maps.app.goo.gl/abc', 'orden' => 0]);
    Sede::create(['ciudad' => 'Cusco', 'direccion' => 'Oculta', 'orden' => 2, 'activo' => false]);

    $this->getJson('/api/sedes')->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.ciudad', 'Arequipa')
        ->assertJsonPath('data.0.telefono', '993 570 000')
        ->assertJsonPath('data.1.ciudad', 'Lima');
});

it('el panel crea, edita y elimina una sede', function () {
    $this->actingAs(User::factory()->create());

    $id = $this->postJson('/api/admin/sedes', [
        'ciudad' => 'Lima', 'nombre' => 'Oficina Lima', 'direccion' => 'Av. Lima 123, Miraflores', 'horario' => 'Lun a Sáb 9 a 6',
        'mapa_url' => 'https://maps.app.goo.gl/xyz', 'orden' => 1, 'activo' => true,
    ])->assertCreated()->assertJsonPath('data.ciudad', 'Lima')->json('data.id');

    $this->putJson("/api/admin/sedes/{$id}", ['ciudad' => 'Lima', 'direccion' => 'Av. Nueva 456', 'orden' => 1, 'activo' => false])->assertOk();
    expect(Sede::find($id)->direccion)->toBe('Av. Nueva 456')->and(Sede::find($id)->activo)->toBeFalse();

    // Oculta: ya no sale en el sitio, pero sigue en el panel
    $this->getJson('/api/sedes')->assertJsonCount(0, 'data');
    $this->getJson('/api/admin/sedes')->assertOk()->assertJsonCount(1, 'data');

    $this->deleteJson("/api/admin/sedes/{$id}")->assertOk();
    expect(Sede::count())->toBe(0);
});

it('valida la sede y no acepta enlaces peligrosos en el mapa', function () {
    $this->actingAs(User::factory()->create());

    $this->postJson('/api/admin/sedes', ['ciudad' => '', 'direccion' => '', 'orden' => 0])->assertJsonValidationErrors(['ciudad', 'direccion']);
    $this->postJson('/api/admin/sedes', ['ciudad' => 'Lima', 'direccion' => 'Av. 1', 'orden' => 0, 'mapa_url' => 'javascript:alert(1)'])->assertJsonValidationErrors('mapa_url');
});

it('el panel exige sesión y abre su pantalla', function () {
    $this->getJson('/api/admin/sedes')->assertUnauthorized();
    $this->postJson('/api/admin/sedes', [])->assertUnauthorized();

    $this->actingAs(User::factory()->create())->get('/admin/sedes')->assertOk();
});
