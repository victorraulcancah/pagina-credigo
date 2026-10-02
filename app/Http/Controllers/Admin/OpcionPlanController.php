<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServicioResource;
use App\Models\OpcionPlan;
use App\Services\OpcionPlanService;
use Inertia\Inertia;
use Inertia\Response;

/** Pantalla del Cotizador (opciones por plan). Los cambios van por la API: /api/admin/cotizador. */
class OpcionPlanController extends Controller
{
    public function index(OpcionPlanService $opciones): Response
    {
        return Inertia::render('Admin/Cotizador/Index', [
            'erp' => $opciones->catalogoErp(),
            'planes' => ServicioResource::collection($opciones->planesConOpciones())->resolve(),
            'monedas' => OpcionPlan::MONEDAS,
            'frecuencias' => OpcionPlan::FRECUENCIAS,
        ]);
    }
}
