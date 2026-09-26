<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReclamacionRequest;
use App\Models\Reclamacion;
use App\Services\ReclamacionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class LibroReclamacionesController extends Controller
{
    public function __construct(private ReclamacionService $reclamaciones) {}

    public function create(): Response
    {
        return Inertia::render('Web/LibroReclamaciones', [
            'tiposDocumento' => Reclamacion::TIPOS_DOCUMENTO,
            'diasRespuesta' => Reclamacion::DIAS_HABILES_RESPUESTA,
        ]);
    }

    public function store(ReclamacionRequest $request): RedirectResponse
    {
        $reclamacion = $this->reclamaciones->registrar(
            $request->safe()->except('acepta_politica'),
            $request->ip(),
        );

        // Enlace firmado: la constancia solo la ve quien la registró (no se puede adivinar el número)
        return redirect(URL::signedRoute('reclamaciones.constancia', $reclamacion));
    }

    public function constancia(Reclamacion $reclamacion): Response
    {
        return Inertia::render('Web/ReclamacionConstancia', [
            'reclamacion' => $reclamacion->makeHidden(['respuesta', 'respondido_por']),
            'diasRespuesta' => Reclamacion::DIAS_HABILES_RESPUESTA,
        ]);
    }
}
