<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\MensajeContactoResource;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends BaseApiController
{
    public function __construct(private DashboardService $dashboard) {}

    public function __invoke(): JsonResponse
    {
        return $this->successResponse([
            'resumen' => $this->dashboard->resumen(),
            'erp' => $this->dashboard->erp(),
            'ultimos_mensajes' => MensajeContactoResource::collection($this->dashboard->ultimasSolicitudes()),
        ], 'Resumen del panel');
    }
}
