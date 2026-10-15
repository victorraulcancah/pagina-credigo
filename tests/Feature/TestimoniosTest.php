<?php

use App\Models\Testimonio;
use App\Models\User;
use App\Services\PaginaService;
use Database\Seeders\ConfiguracionSeeder;
use Database\Seeders\ContenidoSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\Fluent\AssertableJson;

/** Historia publicable (con la autorización del conductor), con datos de prueba. */
function historia(array $datos = []): Testimonio
{
    static $n = 0;
    $n++;

    return Testimonio::create([
        'nombre' => "Conductor {$n}",
        'ciudad' => 'Arequipa',
        'comentario' => 'Comentario de prueba.',
        'autorizado' => true,
        'activo' => true,
        'orden' => $n,
        ...$datos,
    ]);
}

beforeEach(function () {
    $this->seed([ConfiguracionSeeder::class, ContenidoSeeder::class]);
});

it('el panel crea, edita y elimina una historia con sus fotos', function () {
    Storage::fake('public');
    $this->actingAs(User::factory()->create());

    $this->post('/api/admin/testimonios', [
        'nombre' => 'Edimar',
        'ciudad' => 'Arequipa',
        'comentario' => 'Me siento feliz de haber recibido mi carro.',
        'foto' => UploadedFile::fake()->image('edimar.jpg', 600, 600),
        'foto_vehiculo' => UploadedFile::fake()->image('soluto.png', 800, 500),
        'vehiculo' => 'KIA Soluto · CrediYango',
        'calificacion' => 5,
        'autorizado' => true,
        'orden' => 0,
        'activo' => true,
    ])->assertCreated()
        ->assertJsonPath('data.nombre', 'Edimar')
        ->assertJsonPath('data.autorizado', true);

    $testimonio = Testimonio::sole();
    Storage::disk('public')->assertExists([$testimonio->foto, $testimonio->foto_vehiculo]);

    $this->getJson('/api/admin/testimonios')->assertOk()->assertJsonCount(1, 'data');

    // Al editar se cambia el texto y se quita la foto del vehículo
    $this->post("/api/admin/testimonios/{$testimonio->id}", [
        '_method' => 'put',
        'nombre' => 'Edimar R.',
        'comentario' => 'Cumplí mi sueño.',
        'quitar_foto_vehiculo' => true,
        'autorizado' => true,
        'orden' => 0,
        'activo' => true,
    ])->assertOk()->assertJsonPath('data.foto_vehiculo_url', null);
    Storage::disk('public')->assertMissing($testimonio->foto_vehiculo);
    expect($testimonio->fresh()->nombre)->toBe('Edimar R.');

    $foto = $testimonio->fresh()->foto;
    $this->deleteJson("/api/admin/testimonios/{$testimonio->id}")->assertOk();
    expect(Testimonio::count())->toBe(0);
    Storage::disk('public')->assertMissing($foto);
});

it('no deja publicar una historia sin la autorización del conductor', function () {
    $this->actingAs(User::factory()->create());
    $datos = ['nombre' => 'Sin permiso', 'comentario' => 'Texto.', 'orden' => 0];

    $this->postJson('/api/admin/testimonios', [...$datos, 'activo' => true, 'autorizado' => false])
        ->assertJsonValidationErrors(['autorizado' => 'autorización del conductor']);
    $this->postJson('/api/admin/testimonios', [...$datos, 'activo' => true])->assertJsonValidationErrors('autorizado');

    // Oculta sí se puede guardar, mientras llega la autorización
    $this->postJson('/api/admin/testimonios', [...$datos, 'activo' => false, 'autorizado' => false])->assertCreated();
});

it('valida la calificación y el enlace del video', function () {
    $this->actingAs(User::factory()->create());

    $this->postJson('/api/admin/testimonios', [
        'nombre' => 'X', 'comentario' => 'Y', 'orden' => 0, 'activo' => false,
        'calificacion' => 6, 'video_url' => 'https://ejemplo.com/video',
    ])->assertJsonValidationErrors(['calificacion', 'video_url']);
});

it('el inicio muestra solo las historias publicadas, en orden y sin datos internos', function () {
    $segunda = historia(['nombre' => 'Segunda', 'orden' => 2]);
    historia(['nombre' => 'Primera', 'orden' => 1]);
    historia(['nombre' => 'Oculta', 'activo' => false]);
    historia(['nombre' => 'Sin autorizar', 'autorizado' => false, 'activo' => false]);
    // Sin autorización no se publica aunque esté marcada como visible (datos antiguos o cargados a mano)
    Testimonio::whereKey(historia(['nombre' => 'Visible sin permiso'])->id)->update(['autorizado' => false]);

    paginaApi('inicio', fn (AssertableJson $page) => $page
        ->has('testimonios', 2)
        ->where('testimonios.0.nombre', 'Primera')
        ->where('testimonios.1.id', $segunda->id)
        ->where('total_testimonios', 2)
        ->missing('testimonios.0.autorizado')
        ->missing('testimonios.0.activo')
        ->where('secciones', fn ($s) => collect($s)->has('inicio.testimonios'))
        ->etc());
});

it('el carrusel del inicio lleva solo las primeras; el total decide "Ver más historias"', function () {
    foreach (range(1, PaginaService::TESTIMONIOS_INICIO + 2) as $i) {
        historia();
    }

    paginaApi('inicio', fn (AssertableJson $page) => $page
        ->has('testimonios', PaginaService::TESTIMONIOS_INICIO)
        ->where('total_testimonios', PaginaService::TESTIMONIOS_INICIO + 2)
        ->etc());

    paginaApi('historias', fn (AssertableJson $page) => $page->has('testimonios', PaginaService::TESTIMONIOS_INICIO + 2)->etc());
});

it('la página /historias siempre abre; a Google se le muestra solo cuando hay historias', function () {
    // Sin historias publicadas abre igual (con su encabezado y un aviso), pero no va al sitemap
    $this->get('/historias')->assertOk();
    paginaApi('historias', fn (AssertableJson $page) => $page->has('testimonios', 0)->etc());
    $this->get('/sitemap.xml')->assertDontSee(url('/historias'), false);

    historia();

    $this->get('/historias')->assertOk();
    paginaApi('historias', fn (AssertableJson $page) => $page
        ->has('testimonios', 1)
        ->where('secciones', fn ($s) => collect($s)->has('historias.hero')));
    $this->get('/sitemap.xml')->assertSee(url('/historias'), false);
});
