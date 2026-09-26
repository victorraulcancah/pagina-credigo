<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\OpcionPlanRequest;
use App\Models\OpcionPlan;
use App\Models\Servicio;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/** Opciones del cotizador, agrupadas por plan (servicio). */
class OpcionPlanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Cotizador/Index', [
            'planes' => Servicio::ordenado()
                ->with(['opciones' => fn ($q) => $q->ordenado()])
                ->get(['id', 'titulo', 'etiqueta', 'icono', 'activo']),
            'monedas' => OpcionPlan::MONEDAS,
            'frecuencias' => OpcionPlan::FRECUENCIAS,
        ]);
    }

    public function store(OpcionPlanRequest $request): RedirectResponse
    {
        OpcionPlan::create($request->validated());

        Inertia::flash('success', 'Opción creada');

        return back();
    }

    public function update(OpcionPlanRequest $request, OpcionPlan $opcion): RedirectResponse
    {
        $opcion->update($request->validated());

        Inertia::flash('success', 'Opción actualizada');

        return back();
    }

    public function destroy(OpcionPlan $opcion): RedirectResponse
    {
        $opcion->delete();

        Inertia::flash('success', 'Opción eliminada');

        return back();
    }
}
