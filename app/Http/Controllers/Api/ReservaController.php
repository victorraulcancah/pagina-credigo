<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\ReservaRequest;
use App\Services\ReservaService;
use Illuminate\Http\JsonResponse;

/** Formulario de reserva de la web → panel (Reservas) + aviso por correo + WhatsApp ya escrito. */
class ReservaController extends BaseApiController
{
    public function store(ReservaRequest $request, ReservaService $reservas): JsonResponse
    {
        $datos = $request->validated();
        $reservas->registrar($datos, $request->ip());

        // Igual respuesta aunque sea un bot (no se le avisa que fue descartado)
        return $this->createdResponse(
            ['whatsapp_url' => $reservas->enlaceWhatsapp($datos)],
            '¡Listo! Recibimos tu reserva y te confirmaremos por WhatsApp.',
        );
    }
}
