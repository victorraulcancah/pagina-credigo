<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\ServicioRequest;
use App\Http\Resources\ServicioResource;
use App\Models\Servicio;
use App\Services\ServicioService;
use Illuminate\Http\JsonResponse;

/** Planes y servicios del sitio. */
class ServicioController extends BaseApiController
{
    public function __construct(private ServicioService $servicios) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(ServicioResource::collection($this->servicios->listar()), 'Servicios');
    }

    public function show(Servicio $servicio): JsonResponse
    {
        return $this->successResponse(new ServicioResource($servicio), 'Servicio');
    }

    public function store(ServicioRequest $request): JsonResponse
    {
        return $this->createdResponse(new ServicioResource($this->servicios->crear($request->validated())), 'Servicio creado');
    }

    public function update(ServicioRequest $request, Servicio $servicio): JsonResponse
    {
        return $this->successResponse(new ServicioResource($this->servicios->actualizar($servicio, $request->validated())), 'Servicio actualizado');
    }

    public function destroy(Servicio $servicio): JsonResponse
    {
        $this->servicios->eliminar($servicio);

        return $this->successResponse(null, 'Servicio eliminado');
    }
}
