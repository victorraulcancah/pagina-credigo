<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactoRequest;
use App\Mail\NuevaSolicitud;
use App\Models\MensajeContacto;
use App\Services\AvisoEquipoService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

/** Formulario de contacto y solicitudes del cotizador → bandeja del panel + aviso por correo. */
class ContactoController extends Controller
{
    public function store(ContactoRequest $request, AvisoEquipoService $aviso): RedirectResponse
    {
        // Bot detectado (llenó el campo oculto): se responde igual pero no se guarda
        if (! $request->filled('website')) {
            $mensaje = MensajeContacto::create([
                ...$request->safe()->except(['website', 'acepta_politica']),
                'origen' => $request->validated('origen') ?? 'contacto',
                'ip' => $request->ip(),
            ]);

            $aviso->enviar(new NuevaSolicitud($mensaje));
        }

        Inertia::flash('success', '¡Gracias! Recibimos tu mensaje y te contactaremos pronto.');

        return back();
    }
}
