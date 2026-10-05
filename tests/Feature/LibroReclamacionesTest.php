<?php

use App\Mail\ReclamacionRegistrada;
use App\Mail\ReclamacionRespondida;
use App\Models\Reclamacion;
use App\Models\User;
use Database\Seeders\ConfiguracionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;

function datosReclamacion(array $cambios = []): array
{
    return [
        'tipo' => 'reclamo',
        'nombre' => 'Ana Torres',
        'tipo_documento' => 'DNI',
        'numero_documento' => '12345678',
        'domicilio' => 'Av. Ejército 123, Arequipa',
        'telefono' => '987654321',
        'email' => 'ana@example.com',
        'tipo_bien' => 'servicio',
        'monto_reclamado' => '150.50',
        'descripcion_bien' => 'Plan CrediYango',
        'detalle' => 'No me enviaron mi código de pago.',
        'solucion_esperada' => 'cumplimiento',
        'pedido' => 'Que me envíen el código.',
        'declara_veracidad' => true,
        'acepta_politica' => true,
        'conforme' => true,
        ...$cambios,
    ];
}

beforeEach(function () {
    $this->seed(ConfiguracionSeeder::class);
    Mail::fake();
});

it('muestra el formulario del libro de reclamaciones', function () {
    $this->get('/libro-de-reclamaciones')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Web/LibroReclamaciones'));
});

it('registra la hoja con número correlativo, datos del proveedor y copia por correo', function () {
    $respuesta = $this->post('/api/reclamaciones', datosReclamacion());

    $reclamacion = Reclamacion::sole();
    // La API devuelve el número y el enlace firmado a la constancia
    $respuesta->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.codigo', $reclamacion->codigo)
        ->assertJsonPath('data.constancia_url', URL::signedRoute('reclamaciones.constancia', $reclamacion));

    expect($reclamacion->codigo)->toBe(now()->year.'-000001')
        ->and($reclamacion->estado)->toBe('pendiente')
        ->and($reclamacion->proveedor['ruc'])->toBe('20612112763')
        ->and($reclamacion->fecha_limite)->toBe($reclamacion->created_at->copy()->addWeekdays(15)->toDateString());

    Mail::assertSent(ReclamacionRegistrada::class, fn ($mail) => $mail->hasTo('ana@example.com'));
});

it('valida documento, celular, mínimos de texto, apoderado, "otra solución" y confirmaciones', function () {
    $this->post('/api/reclamaciones', datosReclamacion([
        'numero_documento' => '123',
        'telefono' => '812345678',
        'detalle' => 'Muy corto',
        'pedido' => 'Corto',
        'monto_reclamado' => '',
        'menor_de_edad' => true,
        'apoderado' => '',
        'solucion_esperada' => 'otra',
        'solucion_otra' => '',
        'declara_veracidad' => false,
        'acepta_politica' => false,
        'conforme' => false,
    ]))->assertJsonValidationErrors([
        'numero_documento', 'telefono', 'detalle', 'pedido', 'monto_reclamado',
        'apoderado', 'apoderado_numero_documento', 'solucion_otra',
        'declara_veracidad', 'acepta_politica', 'conforme',
    ]);

    expect(Reclamacion::count())->toBe(0);
});

it('acepta el celular con espacios y guarda los datos de la compra y la solución', function () {
    $this->post('/api/reclamaciones', datosReclamacion([
        'telefono' => '987 654 321',
        'comprobante_tipo' => 'boleta',
        'comprobante_numero' => 'B001-00012345',
        'fecha_compra' => now()->subDays(3)->toDateString(),
        'producto_nombre' => 'Celular Redmi 14',
        'producto_marca' => 'Xiaomi',
        'solucion_esperada' => 'otra',
        'solucion_otra' => 'Que me llamen',
    ]))->assertSuccessful();

    $reclamacion = Reclamacion::sole();
    expect($reclamacion->telefono)->toBe('987654321')
        ->and($reclamacion->comprobante_texto)->toBe('Boleta de venta')
        ->and($reclamacion->solucion_texto)->toBe('Que me llamen')
        ->and($reclamacion->declara_veracidad)->toBeTrue()
        ->and($reclamacion->acepta_datos)->toBeTrue()
        ->and($reclamacion->conforme)->toBeTrue();
});

it('guarda los adjuntos en el disco privado y el panel los puede ver', function () {
    Storage::fake('local');

    $this->post('/api/reclamaciones', datosReclamacion([
        'fotos' => [UploadedFile::fake()->image('foto1.jpg'), UploadedFile::fake()->image('foto2.png')],
        'comprobante_archivo' => UploadedFile::fake()->create('boleta.pdf', 200, 'application/pdf'),
        'video' => UploadedFile::fake()->create('video.mp4', 1024, 'video/mp4'),
    ]))->assertSuccessful();

    $reclamacion = Reclamacion::sole();
    expect($reclamacion->adjuntos)->toHaveCount(4)
        ->and($reclamacion->adjuntos->pluck('tipo')->sort()->values()->all())->toBe(['comprobante', 'foto', 'foto', 'video']);

    $adjunto = $reclamacion->adjuntos->first();
    Storage::disk('local')->assertExists($adjunto->ruta);

    // Sin sesión no se puede ver; con sesión sí
    $this->getJson("/api/admin/reclamaciones/adjuntos/{$adjunto->id}")->assertUnauthorized();
    $this->actingAs(User::factory()->create())->get("/api/admin/reclamaciones/adjuntos/{$adjunto->id}")->assertOk();

    // Se abre dentro del panel (no se descarga) y el video se puede pedir por partes para adelantarlo
    $video = $reclamacion->adjuntos->firstWhere('tipo', 'video');
    Storage::disk('local')->put($video->ruta, str_repeat('x', 500)); // el archivo falso llega vacío
    $this->get("/api/admin/reclamaciones/adjuntos/{$video->id}")
        ->assertOk()
        ->assertHeader('Content-Type', 'video/mp4')
        ->assertHeader('Accept-Ranges', 'bytes')
        ->assertHeader('Content-Disposition', 'inline; filename=video.mp4');
    $this->get("/api/admin/reclamaciones/adjuntos/{$video->id}", ['Range' => 'bytes=0-99'])->assertStatus(206);
});

it('rechaza adjuntos demasiado pesados o de otro formato', function () {
    $this->post('/api/reclamaciones', datosReclamacion([
        'fotos' => [UploadedFile::fake()->image('grande.jpg')->size(6000)],
        'video' => UploadedFile::fake()->create('video.avi', 100, 'video/x-msvideo'),
    ]))->assertJsonValidationErrors(['fotos.0', 'video']);

    expect(Reclamacion::count())->toBe(0);
});

it('solo muestra la constancia con el enlace firmado', function () {
    $this->post('/api/reclamaciones', datosReclamacion());
    $reclamacion = Reclamacion::sole();

    $this->get("/libro-de-reclamaciones/constancia/{$reclamacion->id}")->assertForbidden();

    // La página firmada da la dirección (también firmada) de la API con los datos
    $pagina = $this->get(URL::signedRoute('reclamaciones.constancia', $reclamacion))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Web/ReclamacionConstancia')->missing('reclamacion'));
    $datosUrl = $pagina->viewData('page')['props']['datosUrl'];
    expect($datosUrl)->toContain('/api/reclamaciones/')->toContain('signature=');

    $this->getJson($datosUrl)->assertOk()
        ->assertJsonPath('data.codigo', $reclamacion->codigo)
        ->assertJsonMissingPath('data.respuesta')
        ->assertJsonPath('opciones.dias_respuesta', Reclamacion::DIAS_HABILES_RESPUESTA);

    // Sin firma, la API tampoco la entrega
    $this->getJson("/api/reclamaciones/{$reclamacion->id}/constancia")->assertForbidden();
});

it('el panel responde la reclamación y la envía por correo', function () {
    $this->post('/api/reclamaciones', datosReclamacion());
    $reclamacion = Reclamacion::sole();
    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->put("/api/admin/reclamaciones/{$reclamacion->id}/respuesta", ['respuesta' => 'Te enviamos tu código de pago por WhatsApp.'])
        ->assertSuccessful();

    $reclamacion->refresh();
    expect($reclamacion->estado)->toBe('atendido')
        ->and($reclamacion->respondido_por)->toBe($admin->id)
        ->and($reclamacion->respondido_at)->not->toBeNull();

    Mail::assertSent(ReclamacionRespondida::class, fn ($mail) => $mail->hasTo('ana@example.com'));
});

it('lista las reclamaciones en el panel', function () {
    $this->post('/api/reclamaciones', datosReclamacion());

    $this->actingAs(User::factory()->create());

    // La pantalla solo se abre; el contador del menú y la lista se piden a la API
    $this->get('/admin/reclamaciones?estado=pendiente')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Reclamaciones/Index')
        ->missing('reclamacionesPendientes'));
    $this->getJson('/api/admin/contadores')->assertOk()->assertJsonPath('data.reclamaciones_pendientes', 1);

    $this->getJson('/api/admin/reclamaciones?estado=pendiente')->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('filtros.estado', 'pendiente')
        ->assertJsonPath('opciones.dias_respuesta', Reclamacion::DIAS_HABILES_RESPUESTA)
        ->assertJsonMissingPath('data.0.ip');
    $this->getJson('/api/admin/reclamaciones?estado=atendido')->assertJsonCount(0, 'data');
});

it('consulta el estado con número de hoja y documento sin exponer datos personales', function () {
    $this->post('/api/reclamaciones', datosReclamacion());
    $reclamacion = Reclamacion::sole();

    $this->get('/libro-de-reclamaciones/consultar')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Web/ConsultarReclamacion')->missing('resultado'));

    $this->post('/api/reclamaciones/consultar', ['codigo' => $reclamacion->codigo, 'numero_documento' => ' 1234 5678 '])
        ->assertOk()
        ->assertJsonPath('data.codigo', $reclamacion->codigo)
        ->assertJsonPath('data.estado', 'pendiente')
        ->assertJsonMissingPath('data.nombre')
        ->assertJsonMissingPath('data.email')
        ->assertJsonMissingPath('data.numero_documento');
});

it('no muestra la hoja si el documento no coincide', function () {
    $this->post('/api/reclamaciones', datosReclamacion());
    $reclamacion = Reclamacion::sole();

    $this->post('/api/reclamaciones/consultar', ['codigo' => $reclamacion->codigo, 'numero_documento' => '87654321'])
        ->assertNotFound()
        ->assertJsonPath('success', false)
        ->assertJsonValidationErrors('codigo')
        ->assertJsonMissingPath('data');
});
