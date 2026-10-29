<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\SedeRequest;
use App\Http\Resources\SedeResource;
use App\Models\Sede;
use App\Services\SedeService;
use Illuminate\Http\JsonResponse;

/** Oficinas de la empresa ("Nuestras oficinas" del pie y de Soporte). */
class SedeController extends BaseApiController
{
    public function __construct(private SedeService $sedes) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(SedeResource::collection($this->sedes->listar()), 'Sedes');
    }

    public function show(Sede $sede): JsonResponse
    {
        return $this->successResponse(new SedeResource($sede), 'Sede');
    }

    public function store(SedeRequest $request): JsonResponse
    {
        return $this->createdResponse(new SedeResource($this->sedes->crear($request->validated())), 'Sede creada');
    }

    public function update(SedeRequest $request, Sede $sede): JsonResponse
    {
        return $this->successResponse(new SedeResource($this->sedes->actualizar($sede, $request->validated())), 'Sede actualizada');
    }

    public function destroy(Sede $sede): JsonResponse
    {
        $this->sedes->eliminar($sede);

        return $this->successResponse(null, 'Sede eliminada');
    }
}
