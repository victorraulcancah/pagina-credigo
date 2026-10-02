<?php

use App\Models\MensajeContacto;
use App\Models\Seccion;
use Database\Seeders\ConfiguracionSeeder;
use Database\Seeders\ContenidoSeeder;
use Illuminate\Testing\Fluent\AssertableJson;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed([ConfiguracionSeeder::class, ContenidoSeeder::class]);
});

it('abre cada página con su título para buscadores y su contenido llega de la API', function (string $url, string $componente, string $pagina) {
    // El servidor solo abre la página (con el título y la vista previa al compartir)
    $this->get($url)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component($componente)
            ->where('pagina', $pagina)
            ->has('seo')
            ->missing('secciones')
            ->where('sitio.empresa_nombre', 'CrediGo'));

    // El contenido lo pide la página a la API
    paginaApi($pagina, fn (AssertableJson $page) => $page->has('secciones'));
})->with([
    'inicio' => ['/', 'Web/Inicio', 'inicio'],
    'nosotros' => ['/nosotros', 'Web/Nosotros', 'nosotros'],
    'servicios' => ['/servicios', 'Web/Servicios', 'servicios'],
    'requisitos' => ['/requisitos', 'Web/Requisitos', 'requisitos'],
    'como pagar' => ['/como-pagar', 'Web/ComoPagar', 'como-pagar'],
    'soporte' => ['/soporte', 'Web/Contacto', 'soporte'],
]);

it('responde 404 en la API a páginas que no existen', function () {
    $this->getJson('/api/paginas/inventada')->assertNotFound()->assertJsonPath('success', false);
    $this->getJson('/api/paginas/planes/no-existe')->assertNotFound();
});

it('muestra los requisitos editables y enlaza a ellos desde "Cómo funciona"', function () {
    paginaApi('requisitos', fn (AssertableJson $page) => $page
        ->where('secciones', fn ($secciones) => collect(['hero', 'documentos', 'datos', 'proceso', 'empresas'])
            ->every(fn ($clave) => collect($secciones)->has("requisitos.{$clave}"))
            && count($secciones['requisitos.documentos']['items']) === 4));

    expect(Seccion::where('pagina', 'inicio')->where('clave', 'como_funciona')->sole())
        ->usaCampo('boton')->toBeTrue()
        ->boton_url->toBe('/requisitos');
});

it('muestra cómo pagar sin cuentas inventadas: se cargan desde el panel', function () {
    paginaApi('como-pagar', fn (AssertableJson $page) => $page
        ->where('secciones', fn ($secciones) => collect(['hero', 'medios', 'cuentas', 'aviso', 'despues', 'descuento'])
            ->every(fn ($clave) => collect($secciones)->has("pagos.{$clave}"))
            && $secciones['pagos.cuentas']['items'] === []));
});

it('redirige la antigua página de contacto a soporte', function () {
    $this->get('/contacto')->assertStatus(301)->assertRedirect('/soporte');
});

it('crea solo las secciones de las páginas pedidas (para migraciones)', function () {
    Seccion::query()->delete();

    ContenidoSeeder::crearSecciones(['requisitos']);

    expect(Seccion::pluck('pagina')->unique()->values()->all())->toBe(['requisitos'])
        ->and(Seccion::count())->toBe(5);
});

it('no envía al sitio las secciones desactivadas', function () {
    Seccion::where('pagina', 'nosotros')->where('clave', 'mision')->update(['activo' => false]);

    paginaApi('nosotros', fn (AssertableJson $page) => $page
        ->where('secciones', fn ($secciones) => ! collect($secciones)->has('nosotros.mision')
            && collect($secciones)->has('nosotros.vision')));
});

it('guarda el mensaje del formulario de contacto', function () {
    $this->post('/api/solicitudes', [
        'nombre' => 'Juan',
        'apellido' => 'Pérez',
        'email' => 'juan@example.com',
        'telefono' => '987 654 321',
        'tipo_consulta' => 'problema_app',
        'asunto' => 'No puedo entrar a la app',
        'mensaje' => 'Quiero información',
        'acepta_politica' => true,
    ])->assertCreated();

    expect(MensajeContacto::sole())
        ->nombre_completo->toBe('Juan Pérez')
        ->tipo_consulta_texto->toBe('Problema con la app')
        ->origen->toBe('contacto')
        ->leido_at->toBeNull();
});

it('valida el formulario de contacto (incluida la aceptación de la política)', function () {
    $this->post('/api/solicitudes', ['nombre' => '', 'telefono' => 'abc', 'tipo_consulta' => 'inventado', 'mensaje' => ''])
        ->assertJsonValidationErrors(['nombre', 'apellido', 'email', 'telefono', 'tipo_consulta', 'asunto', 'mensaje', 'acepta_politica']);

    expect(MensajeContacto::count())->toBe(0);
});

it('descarta los envíos de bots (campo trampa lleno)', function () {
    // Responde igual que a una persona (no le avisa que fue descartado), pero no se guarda
    $this->post('/api/solicitudes', [
        'nombre' => 'Bot',
        'apellido' => 'Spam',
        'email' => 'bot@spam.test',
        'telefono' => '999999999',
        'tipo_consulta' => 'otro',
        'asunto' => 'Oferta',
        'mensaje' => 'spam',
        'website' => 'http://spam.test',
        'acepta_politica' => true,
    ])->assertCreated()->assertJsonPath('success', true);

    expect(MensajeContacto::count())->toBe(0);
});

it('muestra las páginas legales', function (string $url) {
    $this->get($url)->assertOk()->assertInertia(fn (Assert $page) => $page->component('Web/Legal'));
})->with(['/terminos-y-condiciones', '/politica-de-privacidad']);
