<?php

use App\Models\Documento;
use App\Models\Servicio;
use App\Models\User;
use Database\Seeders\ConfiguracionSeeder;
use Database\Seeders\ContenidoSeeder;
use Illuminate\Testing\Fluent\AssertableJson;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed([ConfiguracionSeeder::class, ContenidoSeeder::class]);
    // Cada prueba arma sus propios planes (el seeder trae los de ejemplo)
    Servicio::query()->delete();
});

/** Plan visible con dos opciones del cotizador (una oculta). */
function planConOpciones(array $datos = []): Servicio
{
    $plan = Servicio::create(['titulo' => 'Credi Motos', 'descripcion' => 'Tu moto propia', 'activo' => true, ...$datos]);
    $plan->opciones()->create(['nombre' => 'Moto 5,500', 'moneda' => 'PEN', 'inicial' => 0, 'cuota' => 110, 'numero_cuotas' => 58, 'frecuencia' => 'semanal', 'activo' => true]);
    $plan->opciones()->create(['nombre' => 'Oculta', 'moneda' => 'PEN', 'cuota' => 50, 'frecuencia' => 'semanal', 'activo' => false]);

    return $plan;
}

it('arma la dirección del plan con su nombre y no la repite', function () {
    $uno = Servicio::create(['titulo' => 'Credi Motos', 'descripcion' => 'x']);
    $dos = Servicio::create(['titulo' => 'Credi Motos', 'descripcion' => 'x']);
    $propia = Servicio::create(['titulo' => 'Otro', 'slug' => 'mi-plan', 'descripcion' => 'x']);

    expect($uno->slug)->toBe('credi-motos')
        ->and($dos->slug)->toBe('credi-motos-2')
        ->and($propia->slug)->toBe('mi-plan');

    // Cambiar el nombre no cambia la dirección (los enlaces compartidos siguen funcionando)
    $uno->update(['titulo' => 'Credi Motos 2026']);
    expect($uno->fresh()->slug)->toBe('credi-motos');
});

it('muestra la página del plan con sus opciones visibles, su ficha y los demás planes', function () {
    $plan = planConOpciones(['detalle' => "## Adjudicación\nPor sorteo mensual."]);
    $otro = Servicio::create(['titulo' => 'CrediYango', 'descripcion' => 'Entrega directa', 'activo' => true]);
    Servicio::create(['titulo' => 'Oculto', 'descripcion' => 'x', 'activo' => false]);
    $ficha = Documento::create(['titulo' => 'Ficha Credi Motos', 'categoria' => 'planes', 'servicio_id' => $plan->id, 'archivo' => 'documentos/ficha.pdf', 'tamano' => 1000]);
    Documento::create(['titulo' => 'Ficha CrediYango', 'categoria' => 'planes', 'servicio_id' => $otro->id, 'archivo' => 'documentos/otra.pdf', 'tamano' => 1000]);

    paginaApi('planes/credi-motos', fn (AssertableJson $page) => $page
        ->where('servicio.titulo', 'Credi Motos')
        ->where('servicio.detalle', "## Adjudicación\nPor sorteo mensual.")
        ->has('servicio.opciones', 1)
        ->where('servicio.opciones.0.nombre', 'Moto 5,500')
        ->has('documentos', 1)
        ->where('documentos.0.id', $ficha->id)
        ->has('otros', 1)
        ->where('otros.0.slug', 'crediyango')
        ->where('secciones', fn ($s) => collect($s)->has('requisitos.documentos')));

    // El servidor abre la página con el título y la descripción del plan (vista previa al compartir)
    $this->get('/servicios/credi-motos')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Web/Plan')
        ->where('slug', 'credi-motos')
        ->where('seo.titulo', 'Credi Motos')
        ->where('seo.descripcion', 'Tu moto propia')
        ->missing('servicio'));
});

it('no muestra planes ocultos ni direcciones que no existen', function () {
    Servicio::create(['titulo' => 'Oculto', 'descripcion' => 'x', 'activo' => false]);

    $this->get('/servicios/oculto')->assertNotFound();
    $this->get('/servicios/no-existe')->assertNotFound();
});

it('lleva los planes visibles al menú, a las tarjetas y al sitemap', function () {
    $plan = planConOpciones();
    Servicio::create(['titulo' => 'Oculto', 'descripcion' => 'x', 'activo' => false]);

    // El menú y la lista de planes llegan de la API
    $this->getJson('/api/menu')->assertOk()->assertJsonPath('data.planes', fn ($planes) => collect($planes)->pluck('slug')->all() === ['credi-motos']);
    paginaApi('servicios', fn (AssertableJson $page) => $page->where('servicios.0.slug', 'credi-motos'));

    $this->get('/sitemap.xml')->assertOk()->assertSee(url('/servicios/credi-motos'), false)->assertDontSee('/servicios/oculto', false);

    expect($plan->url())->toBe('/servicios/credi-motos');
});

describe('en el panel', function () {
    beforeEach(function () {
        $this->actingAs(User::factory()->create());
    });

    it('guarda la dirección y el detalle del plan; vacía se arma sola', function () {
        $this->post('/api/admin/servicios', ['titulo' => 'Motos y Mototaxis', 'descripcion' => 'x', 'detalle' => '- Uno', 'orden' => 0, 'activo' => true])
            ->assertSuccessful();
        $plan = Servicio::firstWhere('titulo', 'Motos y Mototaxis');
        expect($plan->slug)->toBe('motos-y-mototaxis')->and($plan->detalle)->toBe('- Uno');

        $this->post("/api/admin/servicios/{$plan->id}", ['_method' => 'put', 'titulo' => 'Motos y Mototaxis', 'slug' => 'motos', 'descripcion' => 'x', 'orden' => 0])
            ->assertSuccessful();
        expect($plan->fresh()->slug)->toBe('motos');

        // Borrar la dirección la vuelve a armar con el nombre
        $this->post("/api/admin/servicios/{$plan->id}", ['_method' => 'put', 'titulo' => 'Motos y Mototaxis', 'slug' => '', 'descripcion' => 'x', 'orden' => 0])
            ->assertSuccessful();
        expect($plan->fresh()->slug)->toBe('motos-y-mototaxis');
    });

    it('rechaza direcciones con espacios, mayúsculas o repetidas', function (string $slug) {
        Servicio::create(['titulo' => 'CrediYango', 'descripcion' => 'x']);

        $this->post('/api/admin/servicios', ['titulo' => 'Nuevo', 'slug' => $slug, 'descripcion' => 'x', 'orden' => 0])
            ->assertJsonValidationErrors('slug');
    })->with(['Credi Motos', 'credi_motos', 'crediyango', '-motos', 'motos/']);
});
