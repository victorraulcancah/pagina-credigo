<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\ImportarOpcionErpRequest;
use App\Http\Requests\Admin\OpcionPlanRequest;
use App\Http\Resources\OpcionPlanResource;
use App\Http\Resources\ServicioResource;
use App\Models\OpcionPlan;
use App\Services\OpcionPlanService;
use Illuminate\Http\JsonResponse;

/** Opciones del cotizador (montos referenciales por plan), a mano o con los precios del ERP. */
class OpcionPlanController extends BaseApiController
{
    public function __construct(private OpcionPlanService $opciones) {}

    /** Planes con sus opciones + el catálogo de precios del ERP. */
    public function index(): JsonResponse
    {
        return $this->successResponse([
            'planes' => ServicioResource::collection($this->opciones->planesConOpciones()),
            'erp' => $this->opciones->catalogoErp(),
            'monedas' => OpcionPlan::MONEDAS,
            'frecuencias' => OpcionPlan::FRECUENCIAS,
        ], 'Cotizador');
    }

    public function show(OpcionPlan $opcion): JsonResponse
    {
        return $this->successResponse(new OpcionPlanResource($opcion), 'Opción');
    }

    public function store(OpcionPlanRequest $request): JsonResponse
    {
        return $this->createdResponse(new OpcionPlanResource($this->opciones->crear($request->validated())), 'Opción creada');
    }

    /** Agrega una opción con los precios del ERP (queda vinculada y se actualiza sola). */
    public function importarErp(ImportarOpcionErpRequest $request): JsonResponse
    {
        $opcion = $this->opciones->importarDesdeErp((int) $request->validated('servicio_id'), $request->validated('erp_ref'));

        return $this->createdResponse(new OpcionPlanResource($opcion), 'Opción agregada con los precios del ERP');
    }

    public function update(OpcionPlanRequest $request, OpcionPlan $opcion): JsonResponse
    {
        return $this->successResponse(new OpcionPlanResource($this->opciones->actualizar($opcion, $request->validated())), 'Opción actualizada');
    }

    public function destroy(OpcionPlan $opcion): JsonResponse
    {
        $this->opciones->eliminar($opcion);

        return $this->successResponse(null, 'Opción eliminada');
    }
}
