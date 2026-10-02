<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PreguntaFrecuenteResource;
use App\Services\PreguntaFrecuenteService;
use Inertia\Inertia;
use Inertia\Response;

/** Pantalla de Preguntas frecuentes. Crear, editar y eliminar van por la API: /api/admin/preguntas. */
class PreguntaFrecuenteController extends Controller
{
    public function index(PreguntaFrecuenteService $preguntas): Response
    {
        return Inertia::render('Admin/Preguntas/Index', [
            'preguntas' => PreguntaFrecuenteResource::collection($preguntas->listar())->resolve(),
        ]);
    }
}
