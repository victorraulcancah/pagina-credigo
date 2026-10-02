<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\FiltroSolicitudesRequest;
use App\Http\Resources\MensajeContactoResource;
use App\Models\MensajeContacto;
use App\Models\User;
use App\Services\SolicitudesExcelService;
use App\Services\SolicitudService;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Pantalla de la bandeja de solicitudes y su descarga en Excel.
 * Seguimiento, leído y eliminar van por la API: /api/admin/solicitudes.
 */
class MensajeContactoController extends Controller
{
    public function __construct(private SolicitudService $solicitudes) {}

    public function index(FiltroSolicitudesRequest $request): Response
    {
        $filtros = $this->solicitudes->filtrosPorDefecto($request->validated());
        $usuario = $request->user()->id;

        return Inertia::render('Admin/Mensajes/Index', [
            'mensajes' => $this->solicitudes->paginar($filtros, $usuario)
                ->through(fn (MensajeContacto $mensaje) => (new MensajeContactoResource($mensaje))->resolve()),
            'filtros' => $filtros,
            'conteos' => $this->solicitudes->conteos($filtros, $usuario),
            'estados' => MensajeContacto::ESTADOS,
            'origenes' => MensajeContacto::ORIGENES,
            'usuarios' => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function exportar(FiltroSolicitudesRequest $request, SolicitudesExcelService $excel): StreamedResponse
    {
        $filtros = $this->solicitudes->filtrosPorDefecto($request->validated());

        return $excel->descargar($this->solicitudes->paraExportar($filtros, $request->user()->id), 'solicitudes-'.now()->format('Y-m-d').'.xlsx');
    }
}
