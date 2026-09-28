<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReclamacionRequest;
use App\Models\Reclamacion;
use App\Services\ReclamacionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            'tiposComprobante' => Reclamacion::TIPOS_COMPROBANTE,
            'soluciones' => Reclamacion::SOLUCIONES,
            'diasRespuesta' => Reclamacion::DIAS_HABILES_RESPUESTA,
            'seo' => [
                'titulo' => 'Libro de Reclamaciones',
                'descripcion' => 'Registra tu reclamo o queja en nuestro Libro de Reclamaciones virtual.',
            ],
        ]);
    }

    public function store(ReclamacionRequest $request): RedirectResponse
    {
        $reclamacion = $this->reclamaciones->registrar($request->datos(), $request->archivos(), $request->ip());

        // Enlace firmado: la constancia solo la ve quien la registró (no se puede adivinar el número)
        return redirect(URL::signedRoute('reclamaciones.constancia', $reclamacion));
    }

    public function constancia(Reclamacion $reclamacion): Response
    {
        return Inertia::render('Web/ReclamacionConstancia', [
            'reclamacion' => $reclamacion->load('adjuntos:id,reclamacion_id,tipo,nombre_original,tamano')
                ->makeHidden(['respuesta', 'respondido_por']),
            'diasRespuesta' => Reclamacion::DIAS_HABILES_RESPUESTA,
        ]);
    }

    /**
     * Consulta del estado de una hoja con su número y el documento del consumidor.
     * El resultado llega por la sesión (tras el POST) y no queda en la URL.
     */
    public function consultar(Request $request): Response
    {
        $id = $request->session()->get('reclamacion_consultada');
        $reclamacion = $id ? Reclamacion::find($id) : null;

        return Inertia::render('Web/ConsultarReclamacion', [
            'resultado' => $reclamacion?->only([
                'codigo', 'tipo', 'estado', 'created_at', 'fecha_limite', 'vencido', 'respuesta', 'respondido_at',
            ]),
            'diasRespuesta' => Reclamacion::DIAS_HABILES_RESPUESTA,
            'seo' => ['titulo' => 'Consultar mi reclamo'],
        ]);
    }

    public function buscar(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'codigo' => ['required', 'string', 'max:20'],
            'numero_documento' => ['required', 'string', 'max:20'],
        ], [], ['codigo' => 'número de hoja', 'numero_documento' => 'número de documento']);

        $reclamacion = Reclamacion::where('codigo', trim($datos['codigo']))
            ->where('numero_documento', strtoupper(preg_replace('/\s+/', '', $datos['numero_documento'])))
            ->first();

        if (! $reclamacion) {
            return back()->withErrors(['codigo' => 'No encontramos una hoja con ese número y documento. Revisa los datos.']);
        }

        return redirect()->route('reclamaciones.consultar')->with('reclamacion_consultada', $reclamacion->id);
    }
}
