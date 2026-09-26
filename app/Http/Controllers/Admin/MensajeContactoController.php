<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MensajeContacto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MensajeContactoController extends Controller
{
    public function index(Request $request): Response
    {
        $filtros = $request->validate([
            'buscar' => ['nullable', 'string', 'max:100'],
            'estado' => ['nullable', 'in:todos,no_leidos'],
        ]);

        $mensajes = MensajeContacto::query()
            ->buscar($filtros['buscar'] ?? null)
            ->when(($filtros['estado'] ?? null) === 'no_leidos', fn ($q) => $q->noLeido())
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Mensajes/Index', [
            'mensajes' => $mensajes,
            'filtros' => [
                'buscar' => $filtros['buscar'] ?? '',
                'estado' => $filtros['estado'] ?? 'todos',
            ],
        ]);
    }

    /** Marca el mensaje como leído o no leído. */
    public function leido(Request $request, MensajeContacto $mensaje): RedirectResponse
    {
        $leido = $request->validate(['leido' => ['required', 'boolean']])['leido'];

        $mensaje->update(['leido_at' => $leido ? ($mensaje->leido_at ?? now()) : null]);

        return back();
    }

    public function destroy(MensajeContacto $mensaje): RedirectResponse
    {
        $mensaje->delete();

        Inertia::flash('success', 'Mensaje eliminado');

        return back();
    }
}
