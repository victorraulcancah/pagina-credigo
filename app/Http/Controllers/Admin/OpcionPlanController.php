<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\OpcionPlanRequest;
use App\Models\OpcionPlan;
use App\Models\Servicio;
use App\Services\Erp\PlanesErp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;

/** Opciones del cotizador, agrupadas por plan (servicio). */
class OpcionPlanController extends Controller
{
    public function index(PlanesErp $planesErp): Response
    {
        $catalogo = $planesErp->catalogo();

        return Inertia::render('Admin/Cotizador/Index', [
            'erp' => [
                'configurado' => (bool) config('services.erp.url'),
                'planes' => $catalogo['items'],
                'actualizado' => $catalogo['actualizado'],
            ],
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

    /** Agrega al cotizador una opción con los precios del ERP (queda vinculada y se actualiza sola). */
    public function importarErp(Request $request, PlanesErp $planesErp): RedirectResponse
    {
        $datos = $request->validate([
            'servicio_id' => ['required', 'exists:servicios,id'],
            'erp_ref' => ['required', 'string', 'regex:/^[bv]\d+$/'],
        ], [], ['servicio_id' => 'plan']);

        $precio = $planesErp->opcion($datos['erp_ref']);

        if (! $precio || ! $precio['importable']) {
            return back()->withErrors(['erp_ref' => 'Ese precio ya no está disponible en el ERP. Actualiza la lista e inténtalo de nuevo.']);
        }

        OpcionPlan::create([
            ...Arr::only($precio, ['nombre', 'nota', 'moneda', 'inicial', 'cuota', 'numero_cuotas', 'frecuencia']),
            'servicio_id' => $datos['servicio_id'],
            'erp_ref' => $datos['erp_ref'],
            'orden' => OpcionPlan::where('servicio_id', $datos['servicio_id'])->count(),
        ]);

        Inertia::flash('success', 'Opción agregada con los precios del ERP');

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
