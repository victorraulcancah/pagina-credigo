<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\FiltroSolicitudesRequest;
use App\Http\Requests\Admin\LeidoRequest;
use App\Http\Requests\Admin\SeguimientoSolicitudRequest;
use App\Http\Resources\MensajeContactoResource;
use App\Models\MensajeContacto;
use App\Models\User;
use App\Services\SolicitudesExcelService;
use App\Services\SolicitudService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** Bandeja de solicitudes (soporte y cotizador) con seguimiento tipo CRM. */
class SolicitudController extends BaseApiController
{
    public function __construct(private SolicitudService $solicitudes) {}

    /** Lista paginada con filtros + cantidad por estado + opciones (estados, orígenes y asesores). */
    public function index(FiltroSolicitudesRequest $request): JsonResponse
    {
        $filtros = $this->solicitudes->filtrosPorDefecto($request->validated());
        $usuario = $request->user()->id;

        return $this->paginatedResponse(
            $this->solicitudes->paginar($filtros, $usuario),
            MensajeContactoResource::class,
            'Solicitudes',
            [
                'filtros' => $filtros,
                'conteos' => $this->solicitudes->conteos($filtros, $usuario),
                'opciones' => [
                    'estados' => MensajeContacto::ESTADOS,
                    'origenes' => MensajeContacto::ORIGENES,
                    'usuarios' => User::orderBy('name')->get(['id', 'name']),
                ],
            ],
        );
    }

    /** Excel con las solicitudes que cumplen los filtros (la respuesta es el archivo). */
    public function exportar(FiltroSolicitudesRequest $request, SolicitudesExcelService $excel): StreamedResponse
    {
        $filtros = $this->solicitudes->filtrosPorDefecto($request->validated());

        return $excel->descargar($this->solicitudes->paraExportar($filtros, $request->user()->id), 'solicitudes-'.now()->format('Y-m-d').'.xlsx');
    }

    public function show(MensajeContacto $mensaje): JsonResponse
    {
        return $this->successResponse(new MensajeContactoResource($mensaje->load('asignado:id,name')), 'Solicitud');
    }

    /** Guarda estado, asesor asignado y notas internas. */
    public function seguimiento(SeguimientoSolicitudRequest $request, MensajeContacto $mensaje): JsonResponse
    {
        return $this->successResponse(new MensajeContactoResource($this->solicitudes->seguimiento($mensaje, $request->validated())), 'Seguimiento guardado');
    }

    public function leido(LeidoRequest $request, MensajeContacto $mensaje): JsonResponse
    {
        $leido = $request->boolean('leido');

        return $this->successResponse(
            new MensajeContactoResource($this->solicitudes->marcarLeido($mensaje, $leido)),
            $leido ? 'Marcada como leída' : 'Marcada como no leída',
        );
    }

    public function destroy(MensajeContacto $mensaje): JsonResponse
    {
        $this->solicitudes->eliminar($mensaje);

        return $this->successResponse(null, 'Solicitud eliminada');
    }
}
