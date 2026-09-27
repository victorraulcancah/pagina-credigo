<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MensajeContacto;
use App\Models\User;
use App\Services\SolicitudesExcelService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** Bandeja de solicitudes (contacto y cotizador) con seguimiento tipo CRM. */
class MensajeContactoController extends Controller
{
    public function index(Request $request): Response
    {
        $filtros = $this->filtros($request);

        $mensajes = MensajeContacto::query()
            ->with('asignado:id,name')
            ->filtrar($filtros, $request->user()->id)
            ->latest()
            ->paginate(15)
            ->withQueryString();

        // Cantidad por estado (respeta los demás filtros, no el de estado)
        $conteos = MensajeContacto::query()
            ->filtrar([...$filtros, 'estado' => 'todos'], $request->user()->id)
            ->selectRaw('estado, count(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado');

        return Inertia::render('Admin/Mensajes/Index', [
            'mensajes' => $mensajes,
            'filtros' => $filtros,
            'conteos' => $conteos,
            'estados' => MensajeContacto::ESTADOS,
            'origenes' => MensajeContacto::ORIGENES,
            'usuarios' => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /** Guarda estado, asesor asignado y notas internas. */
    public function seguimiento(Request $request, MensajeContacto $mensaje): RedirectResponse
    {
        $datos = $request->validate([
            'estado' => ['required', Rule::in(array_keys(MensajeContacto::ESTADOS))],
            'asignado_a' => ['nullable', 'exists:users,id'],
            'notas' => ['nullable', 'string', 'max:3000'],
        ]);

        $mensaje->update([...$datos, 'leido_at' => $mensaje->leido_at ?? now()]);

        Inertia::flash('success', 'Seguimiento guardado');

        return back();
    }

    /** Marca el mensaje como leído o no leído. */
    public function leido(Request $request, MensajeContacto $mensaje): RedirectResponse
    {
        $leido = $request->validate(['leido' => ['required', 'boolean']])['leido'];

        $mensaje->update(['leido_at' => $leido ? ($mensaje->leido_at ?? now()) : null]);

        return back();
    }

    public function exportar(Request $request, SolicitudesExcelService $excel): StreamedResponse
    {
        $mensajes = MensajeContacto::query()
            ->with('asignado:id,name')
            ->filtrar($this->filtros($request), $request->user()->id)
            ->latest()
            ->get();

        return $excel->descargar($mensajes, 'solicitudes-'.now()->format('Y-m-d').'.xlsx');
    }

    public function destroy(MensajeContacto $mensaje): RedirectResponse
    {
        $mensaje->delete();

        Inertia::flash('success', 'Solicitud eliminada');

        return back();
    }

    private function filtros(Request $request): array
    {
        $filtros = $request->validate([
            'buscar' => ['nullable', 'string', 'max:100'],
            'estado' => ['nullable', Rule::in(['todos', ...array_keys(MensajeContacto::ESTADOS)])],
            'origen' => ['nullable', Rule::in(['todos', ...array_keys(MensajeContacto::ORIGENES)])],
            'asignado' => ['nullable', 'in:todos,mios,sin_asignar'],
        ]);

        return [
            'buscar' => $filtros['buscar'] ?? '',
            'estado' => $filtros['estado'] ?? 'todos',
            'origen' => $filtros['origen'] ?? 'todos',
            'asignado' => $filtros['asignado'] ?? 'todos',
        ];
    }
}
