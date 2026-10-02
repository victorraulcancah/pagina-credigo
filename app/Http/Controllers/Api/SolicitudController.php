<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\ContactoRequest;
use App\Services\SolicitudService;
use Illuminate\Http\JsonResponse;

/** Formulario de soporte y solicitudes del cotizador → bandeja del panel + aviso por correo. */
class SolicitudController extends BaseApiController
{
    public function store(ContactoRequest $request, SolicitudService $solicitudes): JsonResponse
    {
        $solicitudes->registrar($request->validated(), $request->ip());

        // Igual respuesta aunque sea un bot (no se le avisa que fue descartado)
        return $this->createdResponse(null, '¡Gracias! Recibimos tu mensaje y te contactaremos pronto.');
    }
}
