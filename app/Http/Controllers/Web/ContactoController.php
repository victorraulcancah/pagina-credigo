<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactoRequest;
use App\Models\MensajeContacto;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ContactoController extends Controller
{
    public function store(ContactoRequest $request): RedirectResponse
    {
        // Bot detectado (llenó el campo oculto): se responde igual pero no se guarda
        if (! $request->filled('website')) {
            MensajeContacto::create([
                ...$request->safe()->except('website'),
                'ip' => $request->ip(),
            ]);
        }

        Inertia::flash('success', '¡Gracias! Recibimos tu mensaje y te contactaremos pronto.');

        return back();
    }
}
