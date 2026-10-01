<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Erp\CatalogosErp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class ErpController extends Controller
{
    /** Fuerza la descarga de todos los catálogos (sin esperar la actualización automática). */
    public function sincronizar(CatalogosErp $catalogos): RedirectResponse
    {
        $estado = collect($catalogos->estado(sincronizar: true));
        $fallaron = $estado->filter(fn ($e) => ! $e['actualizado'] || Carbon::parse($e['actualizado'])->lt(now()->subMinute()));

        if ($fallaron->isEmpty()) {
            Inertia::flash('success', 'Datos del ERP actualizados');
        } else {
            Inertia::flash('error', 'El ERP no respondió para: '.$fallaron->keys()->implode(', ').'. Se sigue mostrando la última copia.');
        }

        return back();
    }
}
