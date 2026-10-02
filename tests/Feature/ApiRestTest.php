<?php

use App\Models\Documento;
use App\Models\MensajeContacto;
use App\Models\Servicio;
use App\Models\User;
use Database\Seeders\ConfiguracionSeeder;
use Database\Seeders\ContenidoSeeder;
use Illuminate\Support\Facades\Mail;
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
});
