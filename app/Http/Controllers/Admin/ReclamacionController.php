<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RespuestaReclamacionRequest;
use App\Models\Reclamacion;
use App\Services\ReclamacionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Bandeja del Libro de Reclamaciones. Las hojas no se eliminan (registro legal). */
class ReclamacionController extends Controller
{
    public function __construct(private ReclamacionService $reclamaciones) {}

    public function index(Request $request): Response
    {
        $filtros = $request->validate([
            'buscar' => ['nullable', 'string', 'max:100'],
            'estado' => ['nullable', 'in:todos,pendiente,atendido'],
        ]);
        $estado = $filtros['estado'] ?? 'todos';

        $reclamaciones = Reclamacion::query()
            ->with('respondidoPor:id,name')
            ->buscar($filtros['buscar'] ?? null)
            ->when($estado !== 'todos', fn ($q) => $q->where('estado', $estado))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Reclamaciones/Index', [
            'reclamaciones' => $reclamaciones,
            'filtros' => ['buscar' => $filtros['buscar'] ?? '', 'estado' => $estado],
            'diasRespuesta' => Reclamacion::DIAS_HABILES_RESPUESTA,
        ]);
    }

    public function responder(RespuestaReclamacionRequest $request, Reclamacion $reclamacion): RedirectResponse
    {
        $this->reclamaciones->responder($reclamacion, $request->validated('respuesta'), $request->user());

        Inertia::flash('success', "Respuesta registrada y enviada a {$reclamacion->email}");

        return back();
    }
}
