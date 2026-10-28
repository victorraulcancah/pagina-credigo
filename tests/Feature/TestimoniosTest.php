<?php

use App\Models\Testimonio;
use App\Models\User;
use App\Services\PaginaService;
use Database\Seeders\ConfiguracionSeeder;
use Database\Seeders\ContenidoSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
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

it('valida la calificación y que cada enlace sea de un video de su red', function () {
    $this->actingAs(User::factory()->create());

    $this->postJson('/api/admin/testimonios', [
        'nombre' => 'X', 'comentario' => 'Y', 'orden' => 0, 'activo' => false,
        'calificacion' => 6,
        'tiktok_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // de otra red
        'youtube_url' => 'https://ejemplo.com/video',
        'facebook_url' => 'https://www.tiktok.com/@credigo/video/7312345678901234567',
    ])->assertJsonValidationErrors(['calificacion', 'tiktok_url' => 'video de TikTok', 'youtube_url' => 'video de YouTube', 'facebook_url' => 'video de Facebook']);
});

it('guarda un enlace por red (TikTok, YouTube y Facebook) y el sitio los muestra', function () {
    $this->actingAs(User::factory()->create());
    $enlaces = [
        'tiktok_url' => 'https://www.tiktok.com/@credigo/video/7312345678901234567',
        'youtube_url' => 'https://youtu.be/dQw4w9WgXcQ?si=abc',
        'facebook_url' => 'https://www.facebook.com/reel/1234567890',
    ];

    $this->postJson('/api/admin/testimonios', [
        'nombre' => 'En redes', 'comentario' => 'Texto.', 'orden' => 0, 'activo' => true, 'autorizado' => true,
        // con espacios de más al pegar
        ...array_map(fn ($url) => "  {$url} ", $enlaces),
    ])->assertCreated()->assertJson(['data' => $enlaces]);

    paginaApi('historias', fn (AssertableJson $page) => $page
        ->where('testimonios.0.tiktok_url', $enlaces['tiktok_url'])
        ->where('testimonios.0.youtube_url', $enlaces['youtube_url'])
        ->where('testimonios.0.facebook_url', $enlaces['facebook_url'])
        ->missing('testimonios.0.video_url')
        ->etc());
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

it('completa el enlace corto de TikTok (botón Compartir del celular) al guardar', function () {
    Http::fake([
        'vm.tiktok.com/*' => Http::response('', 301, ['Location' => 'https://www.tiktok.com/@credigo/video/7312345678901234567?_t=8abc&_r=1']),
        'vt.tiktok.com/*' => Http::response('', 404),
        '*' => Http::response('', 200),
    ]);
    $this->actingAs(User::factory()->create());

    $this->postJson('/api/admin/testimonios', [
        'nombre' => 'Con TikTok', 'comentario' => 'Texto.', 'orden' => 0, 'activo' => false,
        'tiktok_url' => 'https://vm.tiktok.com/ZMabc123/',
    ])->assertCreated()->assertJsonPath('data.tiktok_url', 'https://www.tiktok.com/@credigo/video/7312345678901234567');

    // Si TikTok no lleva a un video, se avisa que el enlace no sirve
    $this->postJson('/api/admin/testimonios', [
        'nombre' => 'Enlace roto', 'comentario' => 'Texto.', 'orden' => 0, 'activo' => false,
        'tiktok_url' => 'https://vt.tiktok.com/ZSroto99/',
    ])->assertJsonValidationErrors('tiktok_url');
});

it('sube el video de un testimonio, lo muestra en el sitio y lo quita', function () {
    Storage::fake('public');
    $this->actingAs(User::factory()->create());

    $id = $this->post('/api/admin/testimonios', [
        'nombre' => 'Con video', 'comentario' => 'Texto.', 'orden' => 0, 'activo' => true, 'autorizado' => true,
        'video' => UploadedFile::fake()->create('historia.mp4', 3000, 'video/mp4'),
    ])->assertCreated()->json('data.id');

    $testimonio = Testimonio::findOrFail($id);
    Storage::disk('public')->assertExists($testimonio->video);
    paginaApi('historias', fn (AssertableJson $page) => $page->where('testimonios.0.video_archivo_url', Storage::disk('public')->url($testimonio->video))->etc());

    $this->post("/api/admin/testimonios/{$id}", [
        '_method' => 'put', 'nombre' => 'Con video', 'comentario' => 'Texto.', 'orden' => 0, 'activo' => true, 'autorizado' => true, 'quitar_video' => true,
    ])->assertOk()->assertJsonPath('data.video_archivo_url', null);
    Storage::disk('public')->assertMissing($testimonio->video);
});

it('rechaza videos de otro formato o demasiado pesados', function () {
    $this->actingAs(User::factory()->create());
    $datos = ['nombre' => 'X', 'comentario' => 'Y', 'orden' => 0, 'activo' => false];

    $this->post('/api/admin/testimonios', [...$datos, 'video' => UploadedFile::fake()->create('video.avi', 100, 'video/x-msvideo')], ['Accept' => 'application/json'])
        ->assertJsonValidationErrors(['video' => 'MP4, MOV o WEBM']);
    $this->post('/api/admin/testimonios', [...$datos, 'video' => UploadedFile::fake()->create('grande.mp4', 103000, 'video/mp4')], ['Accept' => 'application/json'])
        ->assertJsonValidationErrors(['video' => '100 MB']);
});

it('cada historia elige el tamaño de su foto y la web lo recibe', function () {
    $this->actingAs(User::factory()->create());
    $datos = ['nombre' => 'Edimar', 'comentario' => 'Feliz con mi carro.', 'autorizado' => true, 'activo' => true, 'orden' => 0];

    // Sin elegir, queda la proporción de siempre
    $this->postJson('/api/admin/testimonios', $datos)->assertCreated()->assertJsonPath('data.tamano_foto', 'horizontal');

    $this->postJson('/api/admin/testimonios', [...$datos, 'tamano_foto' => 'vertical'])->assertCreated()->assertJsonPath('data.tamano_foto', 'vertical');
    $this->postJson('/api/admin/testimonios', [...$datos, 'tamano_foto' => 'gigante'])->assertJsonValidationErrors('tamano_foto');

    paginaApi('historias', fn (AssertableJson $page) => $page
        ->where('testimonios.0.tamano_foto', 'horizontal')
        ->where('testimonios.1.tamano_foto', 'vertical')
        ->etc());
});

it('cada historia elige el ancho de su tarjeta y acepta la foto original', function () {
    $this->actingAs(User::factory()->create());
    $datos = ['nombre' => 'Edimar', 'comentario' => 'Feliz con mi carro.', 'autorizado' => true, 'activo' => true, 'orden' => 0];

    // Sin elegir, queda mediana (dos por fila)
    $this->postJson('/api/admin/testimonios', $datos)->assertCreated()->assertJsonPath('data.tamano_tarjeta', 'mediana');

    $this->postJson('/api/admin/testimonios', [...$datos, 'tamano_tarjeta' => 'grande', 'tamano_foto' => 'original'])
        ->assertCreated()
        ->assertJsonPath('data.tamano_tarjeta', 'grande')
        ->assertJsonPath('data.tamano_foto', 'original');
    $this->postJson('/api/admin/testimonios', [...$datos, 'tamano_tarjeta' => 'enorme'])->assertJsonValidationErrors('tamano_tarjeta');

    paginaApi('historias', fn (AssertableJson $page) => $page
        ->where('testimonios.0.tamano_tarjeta', 'mediana')
        ->where('testimonios.1.tamano_tarjeta', 'grande')
        ->etc());
});
