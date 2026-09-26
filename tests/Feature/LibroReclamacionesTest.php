<?php

use App\Mail\ReclamacionRegistrada;
use App\Mail\ReclamacionRespondida;
use App\Models\Reclamacion;
use App\Models\User;
use Database\Seeders\ConfiguracionSeeder;
use Illuminate\Support\Facades\Mail;
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
        'pedido' => 'Que me envíen el código.',
        'acepta_politica' => true,
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
    $respuesta = $this->post('/libro-de-reclamaciones', datosReclamacion());

    $reclamacion = Reclamacion::sole();
    $respuesta->assertRedirect(URL::signedRoute('reclamaciones.constancia', $reclamacion));

    expect($reclamacion->codigo)->toBe(now()->year.'-000001')
        ->and($reclamacion->estado)->toBe('pendiente')
        ->and($reclamacion->proveedor['ruc'])->toBe('20612112763')
        ->and($reclamacion->fecha_limite)->toBe($reclamacion->created_at->copy()->addWeekdays(15)->toDateString());

    Mail::assertSent(ReclamacionRegistrada::class, fn ($mail) => $mail->hasTo('ana@example.com'));
});

it('valida el documento, el apoderado de menores y la aceptación de la política', function () {
    $this->post('/libro-de-reclamaciones', datosReclamacion([
        'numero_documento' => '123',
        'menor_de_edad' => true,
        'apoderado' => '',
        'acepta_politica' => false,
    ]))->assertSessionHasErrors(['numero_documento', 'apoderado', 'acepta_politica']);

    expect(Reclamacion::count())->toBe(0);
});

it('solo muestra la constancia con el enlace firmado', function () {
    $this->post('/libro-de-reclamaciones', datosReclamacion());
    $reclamacion = Reclamacion::sole();

    $this->get("/libro-de-reclamaciones/constancia/{$reclamacion->id}")->assertForbidden();

    $this->get(URL::signedRoute('reclamaciones.constancia', $reclamacion))->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Web/ReclamacionConstancia')
            ->where('reclamacion.codigo', $reclamacion->codigo));
});

it('el panel responde la reclamación y la envía por correo', function () {
    $this->post('/libro-de-reclamaciones', datosReclamacion());
    $reclamacion = Reclamacion::sole();
    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->put("/admin/reclamaciones/{$reclamacion->id}/respuesta", ['respuesta' => 'Te enviamos tu código de pago por WhatsApp.'])
        ->assertSessionHasNoErrors();

    $reclamacion->refresh();
    expect($reclamacion->estado)->toBe('atendido')
        ->and($reclamacion->respondido_por)->toBe($admin->id)
        ->and($reclamacion->respondido_at)->not->toBeNull();

    Mail::assertSent(ReclamacionRespondida::class, fn ($mail) => $mail->hasTo('ana@example.com'));
});

it('lista las reclamaciones en el panel', function () {
    $this->post('/libro-de-reclamaciones', datosReclamacion());

    $this->actingAs(User::factory()->create())
        ->get('/admin/reclamaciones?estado=pendiente')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Reclamaciones/Index')
            ->has('reclamaciones.data', 1)
            ->where('reclamacionesPendientes', 1));
});
