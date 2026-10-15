<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\VisitasRequest;
use App\Services\VisitaService;
use Illuminate\Http\JsonResponse;

/**
 * Estadísticas del sitio para otros sistemas de la empresa (el dashboard del ERP).
 * GET /api/estadisticas/visitas · con la clave de ESTADISTICAS_TOKEN
 */
class EstadisticaController extends BaseApiController
{
    public function visitas(VisitasRequest $request, VisitaService $visitas): JsonResponse
    {
        return $this->successResponse($visitas->resumen($request->dias()), 'Visitas del sitio');
    }
}
