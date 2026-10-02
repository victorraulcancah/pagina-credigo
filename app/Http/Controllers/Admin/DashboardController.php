<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MensajeContactoResource;
use App\Services\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(DashboardService $dashboard): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'erp' => $dashboard->erp(),
            'resumen' => $dashboard->resumen(),
            'ultimosMensajes' => MensajeContactoResource::collection($dashboard->ultimasSolicitudes())->resolve(),
        ]);
    }
}
