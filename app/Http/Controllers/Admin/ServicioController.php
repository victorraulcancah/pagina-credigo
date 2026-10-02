<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServicioResource;
use App\Services\ServicioService;
use Inertia\Inertia;
use Inertia\Response;

/** Pantalla de Servicios. Crear, editar y eliminar van por la API: /api/admin/servicios. */
class ServicioController extends Controller
{
    public function index(ServicioService $servicios): Response
    {
        return Inertia::render('Admin/Servicios/Index', [
            'servicios' => ServicioResource::collection($servicios->listar())->resolve(),
        ]);
    }
}
