<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\PreguntaFrecuenteRequest;
use App\Http\Resources\PreguntaFrecuenteResource;
use App\Models\PreguntaFrecuente;
use App\Services\PreguntaFrecuenteService;
use Illuminate\Http\JsonResponse;

class PreguntaFrecuenteController extends BaseApiController
{
    public function __construct(private PreguntaFrecuenteService $preguntas) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(PreguntaFrecuenteResource::collection($this->preguntas->listar()), 'Preguntas frecuentes');
    }

    public function show(PreguntaFrecuente $pregunta): JsonResponse
    {
        return $this->successResponse(new PreguntaFrecuenteResource($pregunta), 'Pregunta');
    }

    public function store(PreguntaFrecuenteRequest $request): JsonResponse
    {
        return $this->createdResponse(new PreguntaFrecuenteResource($this->preguntas->crear($request->validated())), 'Pregunta creada');
    }

    public function update(PreguntaFrecuenteRequest $request, PreguntaFrecuente $pregunta): JsonResponse
    {
        return $this->successResponse(new PreguntaFrecuenteResource($this->preguntas->actualizar($pregunta, $request->validated())), 'Pregunta actualizada');
    }

    public function destroy(PreguntaFrecuente $pregunta): JsonResponse
    {
        $this->preguntas->eliminar($pregunta);

        return $this->successResponse(null, 'Pregunta eliminada');
    }
}
