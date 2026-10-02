<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\FiltroReclamacionesRequest;
use App\Http\Requests\Admin\RespuestaReclamacionRequest;
use App\Http\Resources\ReclamacionResource;
use App\Models\Reclamacion;
use App\Services\ReclamacionService;
use Illuminate\Http\JsonResponse;

/** Bandeja del Libro de Reclamaciones. Las hojas no se eliminan (registro legal). */
class ReclamacionController extends BaseApiController
{
    public function __construct(private ReclamacionService $reclamaciones) {}

    public function index(FiltroReclamacionesRequest $request): JsonResponse
    {
        $filtros = ['buscar' => $request->validated('buscar') ?? '', 'estado' => $request->validated('estado') ?? 'todos'];

        return $this->paginatedResponse(
            $this->reclamaciones->paginar($filtros['buscar'], $filtros['estado']),
            ReclamacionResource::class,
            'Reclamaciones',
            ['filtros' => $filtros, 'opciones' => ['dias_respuesta' => Reclamacion::DIAS_HABILES_RESPUESTA]],
        );
    }

    public function show(Reclamacion $reclamacion): JsonResponse
    {
        return $this->successResponse(new ReclamacionResource($reclamacion->load(['respondidoPor:id,name', 'adjuntos'])), 'Reclamación');
    }

    /** Registra la respuesta y se la envía por correo al consumidor. */
    public function responder(RespuestaReclamacionRequest $request, Reclamacion $reclamacion): JsonResponse
    {
        $this->reclamaciones->responder($reclamacion, $request->validated('respuesta'), $request->user());

        return $this->successResponse(
            new ReclamacionResource($reclamacion->refresh()->load(['respondidoPor:id,name', 'adjuntos'])),
            "Respuesta registrada y enviada a {$reclamacion->email}",
        );
    }
}
