<?php

use App\Models\Banner;
use App\Models\Documento;
use App\Models\Seccion;
use App\Models\Servicio;
use App\Models\User;
use Database\Seeders\ConfiguracionSeeder;
use Database\Seeders\ContenidoSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed([ConfiguracionSeeder::class, ContenidoSeeder::class]);
    Storage::fake('public');
});

/** Sube un PDF desde el panel y devuelve el documento creado. */
function subirDocumento(array $datos = []): Documento
{
    test()->post('/admin/documentos', [
        'titulo' => 'Lista de requisitos',
        'categoria' => 'requisitos',
        'orden' => 0,
        'activo' => true,
        'archivo' => UploadedFile::fake()->create('requisitos.pdf', 300, 'application/pdf'),
        ...$datos,
    ])->assertSessionHasNoErrors();

    return Documento::latest('id')->firstOrFail();
}

describe('documentos PDF', function () {
    beforeEach(function () {
        $this->actingAs(User::factory()->create());
    });

    it('sube un PDF con nombre legible y lo muestra en su página', function () {
        $documento = subirDocumento(['descripcion' => 'Todo lo que necesitas']);

        expect($documento->archivo)->toStartWith('documentos/lista-de-requisitos-')->toEndWith('.pdf')
            ->and($documento->tamano)->toBe(300 * 1024);
        Storage::disk('public')->assertExists($documento->archivo);

        $this->get('/requisitos')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('documentos', 1)
            ->where('documentos.0.titulo', 'Lista de requisitos')
            ->where('documentos.0.archivo_url', fn ($url) => str_ends_with($url, $documento->archivo))
            ->missing('documentos.0.archivo'));

        // No aparece en otras páginas
        $this->get('/como-pagar')->assertInertia(fn (Assert $page) => $page->has('documentos', 0));
    });

    it('lista los documentos en el panel con sus categorías y planes', function () {
        subirDocumento();

        $this->get('/admin/documentos')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Documentos/Index')
            ->has('documentos', 1)
            ->has('categorias', count(Documento::CATEGORIAS))
            ->where('categorias.0', ['valor' => 'requisitos', 'nombre' => 'Requisitos', 'url' => '/requisitos'])
            ->has('planes')
            ->where('maxMb', 10));
    });

    it('solo acepta PDF de hasta 10 MB', function () {
        $this->post('/admin/documentos', [
            'titulo' => 'Imagen', 'categoria' => 'requisitos', 'orden' => 0,
            'archivo' => UploadedFile::fake()->image('foto.jpg'),
        ])->assertSessionHasErrors('archivo');

        $this->post('/admin/documentos', [
            'titulo' => 'Pesado', 'categoria' => 'requisitos', 'orden' => 0,
            'archivo' => UploadedFile::fake()->create('pesado.pdf', 11 * 1024, 'application/pdf'),
        ])->assertSessionHasErrors('archivo');

        $this->post('/admin/documentos', ['titulo' => 'Sin archivo', 'categoria' => 'requisitos', 'orden' => 0])
            ->assertSessionHasErrors('archivo');

        expect(Documento::count())->toBe(0);
    });

    it('al reemplazar o eliminar el PDF borra el archivo anterior', function () {
        $documento = subirDocumento();
        $anterior = $documento->archivo;

        // Editar sin archivo conserva el PDF
        $this->post("/admin/documentos/{$documento->id}", ['_method' => 'put', 'titulo' => 'Requisitos 2026', 'categoria' => 'requisitos', 'orden' => 1])
            ->assertSessionHasNoErrors();
        expect($documento->fresh()->archivo)->toBe($anterior);

        $this->post("/admin/documentos/{$documento->id}", [
            '_method' => 'put', 'titulo' => 'Requisitos 2026', 'categoria' => 'requisitos', 'orden' => 1,
            'archivo' => UploadedFile::fake()->create('nuevo.pdf', 100, 'application/pdf'),
        ])->assertSessionHasNoErrors();

        $nuevo = $documento->fresh()->archivo;
        expect($nuevo)->not->toBe($anterior);
        Storage::disk('public')->assertMissing($anterior);
        Storage::disk('public')->assertExists($nuevo);

        $this->delete("/admin/documentos/{$documento->id}");
        Storage::disk('public')->assertMissing($nuevo);
        expect(Documento::count())->toBe(0);
    });

    it('la ficha de un plan va en su página; las generales, en Servicios; las ocultas en ninguna', function () {
        $plan = Servicio::create(['titulo' => 'Credi Motos', 'descripcion' => 'Moto propia', 'activo' => true]);
        subirDocumento(['titulo' => 'Ficha Credi Motos', 'categoria' => 'planes', 'servicio_id' => $plan->id]);
        subirDocumento(['titulo' => 'Brochure', 'categoria' => 'planes']);
        subirDocumento(['titulo' => 'Oculto', 'categoria' => 'planes', 'activo' => false]);
        // El plan solo se guarda en la categoría "planes"
        $requisitos = subirDocumento(['titulo' => 'Requisitos', 'servicio_id' => $plan->id]);

        expect($requisitos->servicio_id)->toBeNull();

        $this->get('/servicios')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('documentos', 1)
            ->where('documentos.0.titulo', 'Brochure'));

        $this->get("/servicios/{$plan->slug}")->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('documentos', 1)
            ->where('documentos.0.titulo', 'Ficha Credi Motos'));
    });

    it('muestra los documentos legales en las dos páginas legales', function () {
        subirDocumento(['titulo' => 'Reglamento', 'categoria' => 'legal']);

        $this->get('/terminos-y-condiciones')->assertOk()->assertInertia(fn (Assert $page) => $page->where('documentos.0.titulo', 'Reglamento'));
        $this->get('/politica-de-privacidad')->assertOk()->assertInertia(fn (Assert $page) => $page->has('documentos', 1));
    });
});

describe('videos por enlace', function () {
    beforeEach(function () {
        $this->actingAs(User::factory()->create());
    });

    it('acepta enlaces de YouTube, TikTok, Facebook y Vimeo en las secciones que admiten video', function (string $url) {
        $seccion = Seccion::where('pagina', 'inicio')->where('clave', 'como_funciona')->firstOrFail();

        $this->post("/admin/secciones/{$seccion->id}", ['_method' => 'put', 'titulo' => 'Cómo funciona', 'video_url' => $url, 'activo' => true])
            ->assertSessionHasNoErrors();

        expect($seccion->fresh()->video_url)->toBe($url);
    })->with([
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://www.youtube.com/watch?si=abc&v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://www.youtube.com/shorts/dQw4w9WgXcQ',
        'https://www.tiktok.com/@credigo/video/7312345678901234567',
        'https://www.facebook.com/credigo/videos/1234567890/',
        'https://www.facebook.com/reel/1234567890',
        'https://vimeo.com/123456789',
    ]);

    it('rechaza enlaces que no son de un video', function (string $url) {
        $seccion = Seccion::where('pagina', 'inicio')->where('clave', 'como_funciona')->firstOrFail();

        $this->post("/admin/secciones/{$seccion->id}", ['_method' => 'put', 'titulo' => 'Cómo funciona', 'video_url' => $url, 'activo' => true])
            ->assertSessionHasErrors('video_url');
    })->with([
        'https://example.com/video.mp4',
        'https://vm.tiktok.com/ZMabc123/',
        'https://fb.watch/abc123/',
        'http://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'javascript:alert(1)',
    ]);

    it('ignora el video en secciones que no lo admiten', function () {
        $seccion = Seccion::where('pagina', 'inicio')->where('clave', 'servicios')->firstOrFail();

        $this->post("/admin/secciones/{$seccion->id}", ['_method' => 'put', 'titulo' => 'Planes', 'video_url' => 'https://youtu.be/dQw4w9WgXcQ', 'activo' => true])
            ->assertSessionHasNoErrors();

        expect($seccion->fresh()->video_url)->toBeNull();
    });

    it('guarda el video de un plan y de un banner', function () {
        $this->post('/admin/servicios', [
            'titulo' => 'Credi Motos', 'descripcion' => 'Moto propia', 'orden' => 0, 'activo' => true,
            'video_url' => 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
        ])->assertSessionHasNoErrors();

        $this->post('/admin/banners', [
            'titulo' => 'Tu propio vehículo', 'orden' => 0, 'activo' => true,
            'video_url' => 'https://youtu.be/dQw4w9WgXcQ',
        ])->assertSessionHasNoErrors();

        $this->post('/admin/servicios', ['titulo' => 'Otro', 'descripcion' => 'x', 'orden' => 1, 'video_url' => 'https://example.com'])
            ->assertSessionHasErrors('video_url');

        expect(Servicio::where('titulo', 'Credi Motos')->value('video_url'))->toBe('https://www.youtube.com/shorts/dQw4w9WgXcQ')
            ->and(Banner::where('titulo', 'Tu propio vehículo')->value('video_url'))->toBe('https://youtu.be/dQw4w9WgXcQ');
    });
});
