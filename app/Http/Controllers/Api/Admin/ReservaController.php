<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\FiltroReservasRequest;
use App\Http\Requests\Admin\SeguimientoReservaRequest;
use App\Http\Resources\ReservaResource;
use App\Http\Resources\TipoReservaResource;
use App\Models\Reserva;
use App\Services\ReservaService;
use App\Services\TipoReservaService;
use Illuminate\Http\JsonResponse;

/** Reservas de la web: lista con filtros, estado y notas internas. */
class ReservaController extends BaseApiController
{
    public function __construct(private ReservaService $reservas) {}

    /** Lista paginada + cantidad por estado + opciones (estados y tipos). */
    public function index(FiltroReservasRequest $request, TipoReservaService $tipos): JsonResponse
    {
        $filtros = $this->reservas->filtrosPorDefecto($request->validated());

        return $this->paginatedResponse($this->reservas->paginar($filtros), ReservaResource::class, 'Reservas', [
            'filtros' => $filtros,
            'conteos' => $this->reservas->conteos($filtros),
            'opciones' => [
                'estados' => Reserva::ESTADOS,
                'tipos' => TipoReservaResource::collection($tipos->listar())->resolve(),
            ],
        ]);
    }

    public function show(Reserva $reserva): JsonResponse
    {
        return $this->successResponse(new ReservaResource($reserva), 'Reserva');
    }

    /** Guarda el estado y las notas internas. */
    public function update(SeguimientoReservaRequest $request, Reserva $reserva): JsonResponse
    {
        return $this->successResponse(new ReservaResource($this->reservas->seguimiento($reserva, $request->validated())), 'Reserva actualizada');
    }

    public function destroy(Reserva $reserva): JsonResponse
    {
        $this->reservas->eliminar($reserva);

        return $this->successResponse(null, 'Reserva eliminada');
    }
}
