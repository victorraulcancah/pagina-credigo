<?php

use App\Models\Articulo;
use App\Models\CategoriaBlog;
use App\Models\User;
use Database\Seeders\ConfiguracionSeeder;
use Database\Seeders\ContenidoSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\Fluent\AssertableJson;
use Inertia\Testing\AssertableInertia as Assert;

/** Artículo publicado (con fecha de hace un rato), con datos de prueba. */
function articulo(array $datos = []): Articulo
{
    static $n = 0;
    $n++;

    return Articulo::create([
        'titulo' => "Artículo {$n}",
        'resumen' => 'Resumen de prueba.',
        'contenido' => "Primer párrafo.\n\n## Un subtítulo\n\nSegundo párrafo.",
        'publicado' => true,
        'publicado_at' => now()->subHours($n),
        ...$datos,
    ]);
}

beforeEach(function () {
    $this->seed([ConfiguracionSeeder::class, ContenidoSeeder::class]);
    // Las categorías iniciales las crea la migración del blog
    if (! CategoriaBlog::exists()) {
        foreach (['Noticias', 'Consejos', 'Novedades'] as $i => $nombre) {
            CategoriaBlog::create(['nombre' => $nombre, 'orden' => $i]);
        }
    }
});

it('el panel crea, edita y elimina un artículo con su portada', function () {
    Storage::fake('public');
    $this->actingAs(User::factory()->create());
    $consejos = CategoriaBlog::where('slug', 'consejos')->sole();

    $this->post('/api/admin/articulos', [
        'titulo' => 'Cómo pagar tu cuota sin salir de casa',
        'categoria_blog_id' => $consejos->id,
        'resumen' => 'Todos los medios de pago.',
        'contenido' => "Texto.\n\n## Paso 1\n\n- Entra a la app",
        'portada' => UploadedFile::fake()->image('portada.jpg', 1600, 900),
        'autor' => 'Equipo CrediGo',
        'publicado' => true,
    ])->assertCreated()
        ->assertJsonPath('data.slug', 'como-pagar-tu-cuota-sin-salir-de-casa')
        ->assertJsonPath('data.categoria.nombre', 'Consejos')
        ->assertJsonPath('data.estado', 'publicado');

    $articulo = Articulo::sole();
    Storage::disk('public')->assertExists($articulo->portada);
    expect($articulo->publicado_at)->not->toBeNull();

    $this->getJson('/api/admin/articulos')->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('opciones.categorias.1.nombre', 'Consejos');

    $this->post("/api/admin/articulos/{$articulo->id}", [
        '_method' => 'put', 'titulo' => 'Título nuevo', 'slug' => $articulo->slug, 'contenido' => 'Otro texto', 'quitar_portada' => true, 'publicado' => false,
    ])->assertOk()->assertJsonPath('data.estado', 'borrador')->assertJsonPath('data.portada_url', null);
    Storage::disk('public')->assertMissing($articulo->portada);

    $this->deleteJson("/api/admin/articulos/{$articulo->id}")->assertOk();
    expect(Articulo::count())->toBe(0);
});

it('sube imágenes para el contenido y las borra junto con el artículo', function () {
    Storage::fake('public');
    $this->actingAs(User::factory()->create());

    $url = $this->post('/api/admin/articulos/imagenes', ['imagen' => UploadedFile::fake()->image('foto.jpg')])
        ->assertCreated()->json('data.url');
    $ruta = 'blog/contenido/'.basename($url);
    Storage::disk('public')->assertExists($ruta);

    $articulo = articulo(['contenido' => "Antes.\n\n![Entrega de llaves]({$url})\n\nDespués."]);
    $this->deleteJson("/api/admin/articulos/{$articulo->id}")->assertOk();

    Storage::disk('public')->assertMissing($ruta);
});

it('el blog muestra solo los artículos publicados cuya fecha ya llegó', function () {
    $noticias = CategoriaBlog::where('slug', 'noticias')->sole();
    articulo(['titulo' => 'Visible', 'categoria_blog_id' => $noticias->id]);
    articulo(['titulo' => 'Borrador', 'publicado' => false]);
    articulo(['titulo' => 'Programado', 'publicado_at' => now()->addDay()]);

    paginaApi('blog', fn (AssertableJson $page) => $page
        ->has('articulos', 1)
        ->where('articulos.0.titulo', 'Visible')
        ->where('articulos.0.categoria.nombre', 'Noticias')
        ->missing('articulos.0.contenido')
        ->missing('articulos.0.estado')
        // El filtro solo ofrece categorías con artículos visibles
        ->has('categorias', 1)
        ->where('categorias.0.slug', 'noticias')
        ->where('secciones', fn ($s) => collect($s)->has('blog.hero'))
        ->etc());

    $this->get('/blog')->assertOk();
    $this->get('/blog/visible')->assertOk();
    $this->get('/blog/borrador')->assertNotFound();
    $this->get('/blog/programado')->assertNotFound();
    $this->getJson('/api/paginas/blog/programado')->assertNotFound();

    $this->get('/sitemap.xml')->assertSee(url('/blog/visible'), false)->assertDontSee(url('/blog/borrador'), false);
});

it('cada artículo tiene su página con el contenido, lectura y relacionados de su categoría', function () {
    [$noticias, $consejos] = [CategoriaBlog::where('slug', 'noticias')->sole(), CategoriaBlog::where('slug', 'consejos')->sole()];
    $principal = articulo(['titulo' => 'Principal', 'categoria_blog_id' => $consejos->id, 'contenido' => str_repeat('palabra ', 450)]);
    articulo(['titulo' => 'Otra noticia', 'categoria_blog_id' => $noticias->id]);
    articulo(['titulo' => 'Otro consejo', 'categoria_blog_id' => $consejos->id]);

    $this->get('/blog/principal')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Web/Articulo')->where('slug', 'principal')->where('seo.titulo', 'Principal'));

    $this->getJson('/api/paginas/blog/principal')->assertOk()
        ->assertJsonPath('data.articulo.minutos_lectura', 3)
        ->assertJsonPath('data.articulo.contenido', str_repeat('palabra ', 450))
        // Primero los de su misma categoría
        ->assertJsonPath('data.relacionados.0.titulo', 'Otro consejo')
        ->assertJsonCount(2, 'data.relacionados')
        ->assertJsonMissingPath('data.relacionados.0.contenido');
});

it('valida el artículo y la dirección', function () {
    $this->actingAs(User::factory()->create());
    articulo(['titulo' => 'Ocupada']);

    $this->postJson('/api/admin/articulos', ['titulo' => '', 'contenido' => ''])->assertJsonValidationErrors(['titulo', 'contenido']);
    $this->postJson('/api/admin/articulos', ['titulo' => 'X', 'contenido' => 'Y', 'slug' => 'ocupada'])->assertJsonValidationErrors('slug');
    $this->postJson('/api/admin/articulos', ['titulo' => 'X', 'contenido' => 'Y', 'video_url' => 'https://ejemplo.com'])->assertJsonValidationErrors('video_url');

    // Mismo título: la dirección no se repite
    $this->postJson('/api/admin/articulos', ['titulo' => 'Ocupada', 'contenido' => 'Y'])->assertCreated()->assertJsonPath('data.slug', 'ocupada-2');
});

it('el panel administra las categorías; al borrar una, sus artículos quedan sin categoría', function () {
    $this->actingAs(User::factory()->create());

    $id = $this->postJson('/api/admin/categorias-blog', ['nombre' => 'Seguridad vial'])->assertCreated()
        ->assertJsonPath('data.slug', 'seguridad-vial')->json('data.id');
    $this->postJson('/api/admin/categorias-blog', ['nombre' => 'Seguridad vial'])->assertJsonValidationErrors('nombre');

    $articulo = articulo(['categoria_blog_id' => $id]);
    $this->getJson('/api/admin/categorias-blog')->assertOk()->assertJsonFragment(['nombre' => 'Seguridad vial', 'articulos_count' => 1]);

    $this->putJson("/api/admin/categorias-blog/{$id}", ['nombre' => 'Manejo seguro'])->assertOk()->assertJsonPath('data.slug', 'manejo-seguro');
    $this->deleteJson("/api/admin/categorias-blog/{$id}")->assertOk();

    expect($articulo->fresh()->categoria_blog_id)->toBeNull();
});

it('sin artículos el blog abre igual (con su aviso) y el panel exige sesión', function () {
    paginaApi('blog', fn (AssertableJson $page) => $page->has('articulos', 0)->etc());
    $this->get('/blog')->assertOk();

    $this->getJson('/api/admin/articulos')->assertUnauthorized();
});
