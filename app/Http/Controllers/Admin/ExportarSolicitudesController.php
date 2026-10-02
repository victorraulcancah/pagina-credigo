<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\FiltroSolicitudesRequest;
use App\Services\SolicitudesExcelService;
use App\Services\SolicitudService;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** Descarga en Excel de las solicitudes que cumplen los filtros de la bandeja (es un archivo, no JSON). */
class ExportarSolicitudesController extends Controller
{
    public function __invoke(FiltroSolicitudesRequest $request, SolicitudService $solicitudes, SolicitudesExcelService $excel): StreamedResponse
    {
        $filtros = $solicitudes->filtrosPorDefecto($request->validated());

        return $excel->descargar($solicitudes->paraExportar($filtros, $request->user()->id), 'solicitudes-'.now()->format('Y-m-d').'.xlsx');
    }
}
