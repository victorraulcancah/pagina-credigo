<?php

use App\Models\Documento;
use App\Models\MensajeContacto;
use App\Models\Servicio;
use App\Models\User;
use Database\Seeders\ConfiguracionSeeder;
use Database\Seeders\ContenidoSeeder;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->seed([ConfiguracionSeeder::class, ContenidoSeeder::class]);
    config(['services.erp.url' => '']);
    Mail::fake();
});

describe('API pública', function () {
    it('responde con el formato estándar { success, message, data }', function (string $url) {
        $this->getJson($url)->assertOk()->assertJsonStructure(['success', 'message', 'data'])->assertJsonPath('success', true);
    })->with([
        '/api/sitio',
        '/api/secciones?paginas=inicio,general',
        '/api/banners',
        '/api/planes',
        '/api/preguntas',
        '/api/documentos?categoria=requisitos',
        '/api/talleres',
        '/api/comercios',
        '/api/cupones',
    ]);

    it('entrega las secciones indexadas por página y clave, sin las de otras páginas', function () {
        $this->getJson('/api/secciones?paginas=inicio,inventada')
            ->assertOk()
            ->assertJsonPath('data', fn ($secciones) => collect($secciones)->keys()->every(fn ($clave) => str_starts_with($clave, 'inicio.'))
                && filled($secciones['inicio.como_funciona']['titulo'] ?? null));
    });

    it('muestra un plan por su dirección con sus opciones visibles y responde 404 si no existe', function () {
        $plan = Servicio::firstWhere('activo', true);
        $plan->opciones()->create(['nombre' => 'Visible', 'moneda' => 'PEN', 'cuota' => 100, 'frecuencia' => 'semanal', 'activo' => true]);
        $plan->opciones()->create(['nombre' => 'Oculta', 'moneda' => 'PEN', 'cuota' => 50, 'frecuencia' => 'semanal', 'activo' => false]);

        $this->getJson("/api/planes/{$plan->slug}")
            ->assertOk()
            ->assertJsonPath('data.plan.slug', $plan->slug)
            ->assertJsonPath('data.plan.url', "/servicios/{$plan->slug}")
            ->assertJsonPath('data.plan.opciones', fn ($opciones) => collect($opciones)->pluck('nombre')->contains('Visible') && ! collect($opciones)->pluck('nombre')->contains('Oculta'));

        $this->getJson('/api/planes/no-existe')->assertNotFound()->assertJsonPath('success', false);
    });

    it('valida la categoría de documentos y no expone la ruta del archivo', function () {
        Documento::create(['titulo' => 'Requisitos', 'categoria' => 'requisitos', 'archivo' => 'documentos/requisitos.pdf', 'tamano' => 1000]);

        $this->getJson('/api/documentos?categoria=inventada')->assertUnprocessable()->assertJsonValidationErrors('categoria');

        $this->getJson('/api/documentos?categoria=requisitos')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.archivo_url', fn ($url) => str_ends_with($url, 'documentos/requisitos.pdf'))
            ->assertJsonMissingPath('data.0.archivo');
    });

    it('registra una solicitud y valida sus datos', function () {
        $this->postJson('/api/solicitudes', [])->assertUnprocessable()->assertJsonValidationErrors(['nombre', 'telefono', 'mensaje', 'acepta_politica']);

        $this->postJson('/api/solicitudes', [
            'nombre' => 'Luis', 'apellido' => 'Quispe', 'email' => 'luis@example.com', 'telefono' => '987654321',
            'tipo_consulta' => 'consulta_general', 'asunto' => 'Plan', 'mensaje' => 'Info', 'acepta_politica' => true,
        ])->assertCreated()->assertJsonPath('success', true);

        expect(MensajeContacto::count())->toBe(1);
    });
});

describe('API del panel', function () {
    it('pide iniciar sesión', function (string $metodo, string $url) {
        $this->json($metodo, $url)->assertUnauthorized();
    })->with([
        ['GET', '/api/admin/dashboard'],
        ['GET', '/api/admin/banners'],
        ['POST', '/api/admin/servicios'],
        ['PUT', '/api/admin/configuracion'],
        ['GET', '/api/admin/solicitudes'],
        ['DELETE', '/api/admin/documentos/1'],
    ]);

    it('una app u otro sistema inicia sesión con token, lo usa y lo revoca al salir', function () {
        $usuario = User::factory()->create(['password' => 'secreto123']);

        // Sin sesión de navegador: la API devuelve un token
        $token = $this->postJson('/api/login', ['email' => $usuario->email, 'password' => 'secreto123', 'dispositivo' => 'app-credigo'])
            ->assertOk()
            ->assertJsonPath('token_type', 'Bearer')
            ->json('token');
        expect($token)->toBeString()->and($usuario->tokens()->count())->toBe(1);

        $this->withToken($token)->getJson('/api/admin/perfil')->assertOk()->assertJsonPath('data.email', $usuario->email);

        $this->withToken($token)->postJson('/api/logout')->assertOk();
        expect($usuario->tokens()->count())->toBe(0);
    });

    it('bloquea el login tras 5 intentos fallidos', function () {
        $usuario = User::factory()->create();

        foreach (range(1, 5) as $intento) {
            $this->postJson('/api/login', ['email' => $usuario->email, 'password' => 'incorrecta'])->assertJsonValidationErrors('email');
        }

        $this->postJson('/api/login', ['email' => $usuario->email, 'password' => 'incorrecta'])
            ->assertJsonValidationErrors(['email' => 'Demasiados']);
    });

    it('lista, crea, edita y elimina por REST con el formato estándar', function () {
        Sanctum::actingAs(User::factory()->create());

        $creado = $this->postJson('/api/admin/preguntas', ['pregunta' => '¿Hay inicial?', 'respuesta' => 'Depende del plan.', 'orden' => 9, 'activo' => true])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Pregunta creada')
            ->assertJsonPath('data.pregunta', '¿Hay inicial?');
        $id = $creado->json('data.id');

        $this->getJson("/api/admin/preguntas/{$id}")->assertOk()->assertJsonPath('data.respuesta', 'Depende del plan.');

        $this->putJson("/api/admin/preguntas/{$id}", ['pregunta' => '¿Hay inicial?', 'respuesta' => 'Sí, en CrediYango.', 'orden' => 9, 'activo' => false])
            ->assertOk()
            ->assertJsonPath('data.activo', false);

        $this->deleteJson("/api/admin/preguntas/{$id}")->assertOk()->assertJsonPath('data', null);
        $this->getJson("/api/admin/preguntas/{$id}")->assertNotFound();
    });

    it('pagina las solicitudes con sus conteos y sin la IP', function () {
        Sanctum::actingAs(User::factory()->create());
        foreach (range(1, 17) as $i) {
            MensajeContacto::create(['nombre' => "Persona {$i}", 'telefono' => '987654321', 'mensaje' => 'Hola', 'origen' => 'contacto', 'estado' => $i <= 2 ? 'contactado' : 'nuevo', 'ip' => '10.0.0.1']);
        }

        $this->getJson('/api/admin/solicitudes?estado=todos')
            ->assertOk()
            ->assertJsonCount(15, 'data')
            ->assertJsonPath('pagination.total', 17)
            ->assertJsonPath('pagination.last_page', 2)
            ->assertJsonPath('conteos.nuevo', 15)
            ->assertJsonPath('conteos.contactado', 2)
            ->assertJsonMissingPath('data.0.ip');

        $this->getJson('/api/admin/solicitudes?estado=inventado')->assertJsonValidationErrors('estado');
    });

    it('devuelve el resumen del panel', function () {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonStructure(['data' => ['resumen' => ['solicitudes_nuevas', 'servicios_activos'], 'erp' => ['configurado', 'catalogos'], 'ultimos_mensajes']]);
    });

    it('da los contadores del menú del panel', function () {
        Sanctum::actingAs(User::factory()->create());
        MensajeContacto::create(['nombre' => 'A', 'telefono' => '987654321', 'mensaje' => 'x', 'origen' => 'contacto']);
        MensajeContacto::create(['nombre' => 'B', 'telefono' => '987654321', 'mensaje' => 'x', 'origen' => 'contacto', 'leido_at' => now()]);

        $this->getJson('/api/admin/contadores')->assertOk()
            ->assertJsonPath('data.mensajes_no_leidos', 1)
            ->assertJsonPath('data.reclamaciones_pendientes', 0);
    });
});

describe('Datos que comparten las páginas', function () {
    it('dice quién está conectado sin pedir sesión (null si nadie)', function () {
        $this->getJson('/api/sesion')->assertOk()->assertJsonPath('data.usuario', null);

        $usuario = User::factory()->create();
        Sanctum::actingAs($usuario);
        $this->getJson('/api/sesion')->assertOk()->assertJsonPath('data.usuario.email', $usuario->email);
    });

    it('da los planes del menú y ya no los manda con cada página', function () {
        $this->getJson('/api/menu')->assertOk()->assertJsonStructure(['data' => ['planes' => [['titulo', 'slug']]]]);

        // Con la página solo llegan los datos del marco (logo, colores, contacto)
        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->has('sitio')
            ->missing('auth')
            ->missing('planesMenu')
            ->missing('mensajesNoLeidos'));
    });
});
