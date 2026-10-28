<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\GrupoOpcionRequest;
use App\Http\Resources\GrupoOpcionResource;
use App\Models\GrupoOpcion;
use App\Services\GrupoOpcionService;
use Illuminate\Http\JsonResponse;

/** Secciones con logo de la lista de opciones de un plan. Se listan junto a los planes en GET /api/admin/cotizador. */
class GrupoOpcionController extends BaseApiController
{
    public function __construct(private GrupoOpcionService $grupos) {}

    public function show(GrupoOpcion $grupo): JsonResponse
    {
        return $this->successResponse(new GrupoOpcionResource($grupo), 'Sección');
    }

    public function store(GrupoOpcionRequest $request): JsonResponse
    {
        return $this->createdResponse(new GrupoOpcionResource($this->grupos->crear($request->validated())), 'Sección creada');
    }

    public function update(GrupoOpcionRequest $request, GrupoOpcion $grupo): JsonResponse
    {
        return $this->successResponse(new GrupoOpcionResource($this->grupos->actualizar($grupo, $request->validated())), 'Sección actualizada');
    }

    public function destroy(GrupoOpcion $grupo): JsonResponse
    {
        $this->grupos->eliminar($grupo);

        return $this->successResponse(null, 'Sección eliminada');
    }
}
