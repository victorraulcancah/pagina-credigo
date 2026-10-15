<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\TipoReservaRequest;
use App\Http\Resources\TipoReservaResource;
use App\Models\TipoReserva;
use App\Services\TipoReservaService;
use Illuminate\Http\JsonResponse;

/** Tipos de reserva (ej. Viaje): lo que se puede reservar en la web. */
class TipoReservaController extends BaseApiController
{
    public function __construct(private TipoReservaService $tipos) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(TipoReservaResource::collection($this->tipos->listar()), 'Tipos de reserva');
    }

    public function store(TipoReservaRequest $request): JsonResponse
    {
        return $this->createdResponse(new TipoReservaResource($this->tipos->crear($request->validated())->loadCount('reservas')), 'Tipo de reserva creado');
    }

    public function update(TipoReservaRequest $request, TipoReserva $tipo): JsonResponse
    {
        return $this->successResponse(new TipoReservaResource($this->tipos->actualizar($tipo, $request->validated())), 'Tipo de reserva actualizado');
    }

    public function destroy(TipoReserva $tipo): JsonResponse
    {
        $this->tipos->eliminar($tipo);

        return $this->successResponse(null, 'Tipo de reserva eliminado');
    }
}
