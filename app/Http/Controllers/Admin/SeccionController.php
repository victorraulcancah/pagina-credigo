<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SeccionResource;
use App\Models\Seccion;
use App\Services\SeccionService;
use Inertia\Inertia;
use Inertia\Response;

/** Pantallas de Secciones. Guardar va por la API: PUT /api/admin/secciones/{id}. */
class SeccionController extends Controller
{
    public function __construct(private SeccionService $secciones) {}

    public function index(): Response
    {
        return Inertia::render('Admin/Secciones/Index', [
            'secciones' => $this->secciones->paraPanel(),
        ]);
    }

    public function edit(Seccion $seccion): Response
    {
        return Inertia::render('Admin/Secciones/Edit', [
            'seccion' => (new SeccionResource($seccion))->resolve(),
        ]);
    }
}
