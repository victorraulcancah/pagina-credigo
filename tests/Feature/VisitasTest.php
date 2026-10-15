<?php

use App\Models\User;
use App\Models\VisitaDiaria;
use App\Services\VisitaService;
use Database\Seeders\ConfiguracionSeeder;
use Database\Seeders\ContenidoSeeder;
use Illuminate\Support\Facades\DB;

const NAVEGADOR = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36';

/** Abre una página pública como lo haría una persona (con su IP y su navegador). */
function visitar(string $ruta, string $ip = '190.10.10.1', string $navegador = NAVEGADOR, array $cabeceras = [])
{
    return test()->withServerVariables(['REMOTE_ADDR' => $ip])->withHeaders(['User-Agent' => $navegador, ...$cabeceras])->get($ruta);
}

function visitasDeHoy(): ?VisitaDiaria
{
    return VisitaDiaria::find(app(VisitaService::class)->hoy()->toDateString());
}

beforeEach(function () {
    $this->seed([ConfiguracionSeeder::class, ContenidoSeeder::class]);
    config(['services.estadisticas.token' => 'clave-de-prueba']);
});

it('cuenta una visita por persona al día y cada página que abre', function () {
    visitar('/')->assertOk();
    visitar('/nosotros')->assertOk();
    visitar('/cotizador')->assertOk();

    expect(visitasDeHoy())->visitas->toBe(1)->paginas_vistas->toBe(3);

    // Otra persona (otra IP) y otro celular en la misma red
    visitar('/', ip: '190.10.10.2');
    visitar('/', navegador: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Safari/604.1');

    expect(visitasDeHoy())->visitas->toBe(3)->paginas_vistas->toBe(5);
});

it('no guarda la IP: solo una huella que no se puede revertir', function () {
    visitar('/');

    $huella = DB::table('visitantes_dia')->sole();
    expect($huella->huella)->toHaveLength(64)->not->toContain('190.10.10.1');
});

it('no cuenta robots, vistas previas, cargas anticipadas ni al equipo con sesión en el panel', function () {
    visitar('/', navegador: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
    visitar('/', navegador: 'WhatsApp/2.23.20.0 A');
    visitar('/', navegador: 'facebookexternalhit/1.1');
    visitar('/', navegador: '');
    visitar('/', cabeceras: ['Purpose' => 'prefetch']);
    visitar('/', cabeceras: ['X-Inertia-Partial-Data' => 'seo']);
    visitar('/pagina-que-no-existe')->assertNotFound();

    $this->actingAs(User::factory()->create());
    visitar('/')->assertOk();
    visitar('/admin')->assertOk();

    expect(visitasDeHoy())->toBeNull();
});

it('no cuenta el login ni las llamadas a la API', function () {
    visitar('/login')->assertOk();
    visitar('/api/sitio')->assertOk();
    visitar('/api/paginas/inicio')->assertOk();
    visitar('/sitemap.xml')->assertOk();

    expect(visitasDeHoy())->toBeNull();
});

it('entrega el resumen de visitas solo con la clave', function () {
    $hoy = app(VisitaService::class)->hoy();
    VisitaDiaria::create(['fecha' => $hoy->toDateString(), 'visitas' => 5, 'paginas_vistas' => 12]);
    VisitaDiaria::create(['fecha' => $hoy->subDay()->toDateString(), 'visitas' => 3, 'paginas_vistas' => 7]);
    VisitaDiaria::create(['fecha' => $hoy->subDays(10)->toDateString(), 'visitas' => 10, 'paginas_vistas' => 30]);
    VisitaDiaria::create(['fecha' => $hoy->subDays(400)->toDateString(), 'visitas' => 100, 'paginas_vistas' => 250]);

    $this->getJson('/api/estadisticas/visitas')->assertUnauthorized();
    $this->withToken('otra-clave')->getJson('/api/estadisticas/visitas')->assertUnauthorized();

    $this->withToken('clave-de-prueba')->getJson('/api/estadisticas/visitas')->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.hoy', ['visitas' => 5, 'paginas_vistas' => 12])
        ->assertJsonPath('data.ayer', ['visitas' => 3, 'paginas_vistas' => 7])
        ->assertJsonPath('data.ultimos_7_dias', ['visitas' => 8, 'paginas_vistas' => 19])
        ->assertJsonPath('data.ultimos_30_dias', ['visitas' => 18, 'paginas_vistas' => 49])
        ->assertJsonPath('data.total', ['visitas' => 118, 'paginas_vistas' => 299])
        ->assertJsonPath('data.desde', $hoy->subDays(400)->toDateString())
        ->assertJsonCount(30, 'data.serie')
        ->assertJsonPath('data.serie.29', ['fecha' => $hoy->toDateString(), 'visitas' => 5, 'paginas_vistas' => 12])
        ->assertJsonPath('data.serie.0.visitas', 0);

    $this->withToken('clave-de-prueba')->getJson('/api/estadisticas/visitas?dias=7')->assertJsonCount(7, 'data.serie');
    $this->withToken('clave-de-prueba')->getJson('/api/estadisticas/visitas?dias=500')->assertJsonValidationErrors('dias');
});

it('sin clave configurada nadie puede leer las visitas', function () {
    config(['services.estadisticas.token' => null]);

    $this->getJson('/api/estadisticas/visitas')->assertUnauthorized();
    $this->withToken('')->getJson('/api/estadisticas/visitas')->assertUnauthorized();
});

it('borra las huellas de días anteriores y conserva las de hoy', function () {
    $servicio = app(VisitaService::class);
    DB::table('visitantes_dia')->insert([
        ['fecha' => $servicio->hoy()->subDay()->toDateString(), 'huella' => str_repeat('a', 64)],
        ['fecha' => $servicio->hoy()->toDateString(), 'huella' => str_repeat('b', 64)],
    ]);

    expect($servicio->limpiarHuellas())->toBe(1)
        ->and(DB::table('visitantes_dia')->count())->toBe(1);
});
