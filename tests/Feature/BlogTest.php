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

/** Artículo publicado (con fecha de hace un rato) en Noticias, con datos de prueba. */
function articulo(array $datos = []): Articulo
{
    static $n = 0;
    $n++;

    return Articulo::create([
        'titulo' => "Artículo {$n}",
        'categoria_blog_id' => CategoriaBlog::where('slug', 'noticias')->value('id'),
        'resumen' => 'Resumen de prueba.',
        'contenido' => "Primer párrafo.\n\n## Un subtítulo\n\nSegundo párrafo.",
        'publicado' => true,
        'publicado_at' => now()->subHours($n),
        ...$datos,
    ]);
}

beforeEach(function () {
    $this->seed([ConfiguracionSeeder::class, ContenidoSeeder::class]);
});

it('el blog tiene sus 3 categorías, cada una con su página', function () {
    expect(CategoriaBlog::orderBy('orden')->pluck('slug')->all())->toBe(['eventos', 'noticias', 'tendencias']);

    foreach (['eventos', 'noticias', 'tendencias'] as $categoria) {
        $this->get("/blog/{$categoria}")->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Web/Blog')->where('categoria', $categoria));
    }

    $this->get('/blog/consejos')->assertNotFound();
    $this->getJson('/api/paginas/blog/consejos')->assertNotFound();
});

it('el panel crea, edita y elimina un artículo con su portada', function () {
    Storage::fake('public');
    $this->actingAs(User::factory()->create());
    $tendencias = CategoriaBlog::where('slug', 'tendencias')->sole();

    $this->post('/api/admin/articulos', [
        'titulo' => 'Cómo pagar tu cuota sin salir de casa',
        'categoria_blog_id' => $tendencias->id,
        'resumen' => 'Todos los medios de pago.',
        'contenido' => "Texto.\n\n## Paso 1\n\n- Entra a la app",
        'portada' => UploadedFile::fake()->image('portada.jpg', 1600, 900),
        'autor' => 'Equipo CrediGo',
        'publicado' => true,
    ])->assertCreated()
        ->assertJsonPath('data.slug', 'como-pagar-tu-cuota-sin-salir-de-casa')
        ->assertJsonPath('data.categoria.nombre', 'Tendencias')
        ->assertJsonPath('data.estado', 'publicado');

    $articulo = Articulo::sole();
    Storage::disk('public')->assertExists($articulo->portada);
    expect($articulo->publicado_at)->not->toBeNull();

    $this->getJson('/api/admin/articulos')->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('opciones.categorias.2.nombre', 'Tendencias');

    $this->post("/api/admin/articulos/{$articulo->id}", [
        '_method' => 'put', 'titulo' => 'Título nuevo', 'slug' => $articulo->slug, 'categoria_blog_id' => $tendencias->id, 'contenido' => 'Otro texto', 'quitar_portada' => true, 'publicado' => false,
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
    articulo(['titulo' => 'Visible']);
    articulo(['titulo' => 'Borrador', 'publicado' => false]);
    articulo(['titulo' => 'Programado', 'publicado_at' => now()->addDay()]);

    paginaApi('blog', fn (AssertableJson $page) => $page
        ->has('articulos', 1)
        ->where('articulos.0.titulo', 'Visible')
        ->where('articulos.0.categoria.slug', 'noticias')
        ->missing('articulos.0.contenido')
        ->missing('articulos.0.estado')
        ->has('categorias', 3)
        ->where('categoria', null)
        ->where('secciones', fn ($s) => collect($s)->has('blog.hero'))
        ->etc());

    $this->get('/blog')->assertOk();
    $this->get('/blog/noticias/visible')->assertOk();
    $this->get('/blog/noticias/borrador')->assertNotFound();
    $this->get('/blog/noticias/programado')->assertNotFound();
    $this->getJson('/api/paginas/blog/noticias/programado')->assertNotFound();

    $this->get('/sitemap.xml')
        ->assertSee(url('/blog/noticias/visible'), false)
        ->assertSee(url('/blog/eventos'), false)
        ->assertDontSee(url('/blog/noticias/borrador'), false);
});

it('cada categoría muestra solo sus artículos y el artículo vive dentro de la suya', function () {
    $eventos = CategoriaBlog::where('slug', 'eventos')->sole();
    articulo(['titulo' => 'Feria de autos', 'categoria_blog_id' => $eventos->id]);
    articulo(['titulo' => 'Nueva oficina']);

    $this->getJson('/api/paginas/blog/eventos')->assertOk()
        ->assertJsonCount(1, 'data.articulos')
        ->assertJsonPath('data.articulos.0.titulo', 'Feria de autos')
        ->assertJsonPath('data.categoria.nombre', 'Eventos');
    $this->getJson('/api/paginas/blog/tendencias')->assertOk()->assertJsonCount(0, 'data.articulos');

    // En otra categoría el artículo no existe
    $this->get('/blog/eventos/feria-de-autos')->assertOk();
    $this->get('/blog/noticias/feria-de-autos')->assertNotFound();
});

it('cada artículo tiene su página con el contenido, lectura y relacionados de su categoría', function () {
    $tendencias = CategoriaBlog::where('slug', 'tendencias')->sole();
    articulo(['titulo' => 'Principal', 'categoria_blog_id' => $tendencias->id, 'contenido' => str_repeat('palabra ', 450)]);
    articulo(['titulo' => 'Otra noticia']);
    articulo(['titulo' => 'Otro consejo', 'categoria_blog_id' => $tendencias->id]);

    $this->get('/blog/tendencias/principal')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Web/Articulo')->where('slug', 'principal')->where('categoria', 'tendencias')->where('seo.titulo', 'Principal'));

    $this->getJson('/api/paginas/blog/tendencias/principal')->assertOk()
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

    $noticias = CategoriaBlog::where('slug', 'noticias')->value('id');

    $this->postJson('/api/admin/articulos', ['titulo' => '', 'contenido' => ''])->assertJsonValidationErrors(['titulo', 'contenido', 'categoria_blog_id']);
    $this->postJson('/api/admin/articulos', ['titulo' => 'X', 'contenido' => 'Y', 'categoria_blog_id' => $noticias, 'slug' => 'ocupada'])->assertJsonValidationErrors('slug');
    $this->postJson('/api/admin/articulos', ['titulo' => 'X', 'contenido' => 'Y', 'categoria_blog_id' => $noticias, 'video_url' => 'https://ejemplo.com'])->assertJsonValidationErrors('video_url');

    // Mismo título: la dirección no se repite
    $this->postJson('/api/admin/articulos', ['titulo' => 'Ocupada', 'contenido' => 'Y', 'categoria_blog_id' => $noticias])->assertCreated()->assertJsonPath('data.slug', 'ocupada-2');
});

it('sin artículos el blog abre igual (con su aviso) y el panel exige sesión', function () {
    paginaApi('blog', fn (AssertableJson $page) => $page->has('articulos', 0)->etc());
    $this->get('/blog')->assertOk();

    $this->getJson('/api/admin/articulos')->assertUnauthorized();
});

describe('contenido escrito con el editor (HTML)', function () {
    beforeEach(function () {
        $this->actingAs(User::factory()->create());
        $this->noticias = CategoriaBlog::where('slug', 'noticias')->value('id');
    });

    it('guarda el formato del editor y descarta lo peligroso', function () {
        $html = '<p style="text-align: center">Hola <strong>mundo</strong> <span style="color: #ff0000; position: fixed">rojo</span></p>'
            .'<h2>Subtítulo</h2><script>alert(1)</script>'
            .'<p><a href="javascript:alert(1)" onclick="robar()">enlace malo</a> <a href="https://credigo.pe" target="_blank">bueno</a></p>'
            .'<img src="/storage/blog/contenido/a.jpg" alt="Pie" onerror="alert(1)">'
            .'<div class="galeria evil"><img src="/storage/blog/contenido/b.jpg" alt=""><iframe src="https://malo.com"></iframe></div>';

        $guardado = $this->postJson('/api/admin/articulos', ['titulo' => 'Con formato', 'contenido' => $html, 'categoria_blog_id' => $this->noticias])
            ->assertCreated()->json('data.contenido');

        expect($guardado)
            ->toContain('text-align:center')->toContain('<strong>mundo</strong>')->toContain('color:#ff0000')->toContain('<h2>Subtítulo</h2>')
            ->toContain('href="https://credigo.pe"')->toContain('class="galeria"')->toContain('src="/storage/blog/contenido/a.jpg"')
            ->not->toContain('<script')->not->toContain('alert(1)')->not->toContain('javascript:')->not->toContain('onclick')
            ->not->toContain('onerror')->not->toContain('position')->not->toContain('<iframe')->not->toContain('evil');
    });

    it('el texto simple de los artículos anteriores no se toca', function () {
        $texto = "Antes.\n\n## Subtítulo\n\n![pie](/storage/blog/contenido/x.jpg)";

        $this->postJson('/api/admin/articulos', ['titulo' => 'Antiguo', 'contenido' => $texto, 'categoria_blog_id' => $this->noticias])
            ->assertCreated()->assertJsonPath('data.contenido', $texto);
    });

    it('calcula el tiempo de lectura sin contar etiquetas ni imágenes', function () {
        $articulo = articulo(['contenido' => '<p>'.str_repeat('palabra ', 450).'</p><img src="/storage/blog/contenido/a.jpg" alt="una foto larga de prueba">']);

        expect($articulo->minutosLectura())->toBe(3);
    });

    it('al eliminar el artículo borra las imágenes del editor', function () {
        Storage::fake('public');
        $url = $this->post('/api/admin/articulos/imagenes', ['imagen' => UploadedFile::fake()->image('foto.jpg')])->json('data.url');
        $ruta = 'blog/contenido/'.basename($url);

        $id = $this->postJson('/api/admin/articulos', ['titulo' => 'Con foto', 'contenido' => "<p>Texto</p><img src=\"{$url}\" alt=\"\">", 'categoria_blog_id' => $this->noticias])
            ->json('data.id');
        $this->deleteJson("/api/admin/articulos/{$id}")->assertOk();

        Storage::disk('public')->assertMissing($ruta);
    });
});
