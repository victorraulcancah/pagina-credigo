<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReclamacionResource;
use App\Models\Reclamacion;
use Inertia\Inertia;
use Inertia\Response;

/** Pantallas del Libro de Reclamaciones. Registrar y consultar van por la API (/api/reclamaciones). */
class LibroReclamacionesController extends Controller
{
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

    /** Constancia de la hoja (enlace firmado: solo la ve quien la registró). Sin la respuesta interna. */
    public function constancia(Reclamacion $reclamacion): Response
    {
        $datos = (new ReclamacionResource($reclamacion->load('adjuntos')))->resolve();

        return Inertia::render('Web/ReclamacionConstancia', [
            'reclamacion' => collect($datos)->except(['respuesta', 'respondido_por', 'respondido_por_id'])->all(),
            'diasRespuesta' => Reclamacion::DIAS_HABILES_RESPUESTA,
        ]);
    }

    /** Pantalla de consulta: el resultado llega de POST /api/reclamaciones/consultar (no queda en la URL). */
    public function consultar(): Response
    {
        return Inertia::render('Web/ConsultarReclamacion', [
            'diasRespuesta' => Reclamacion::DIAS_HABILES_RESPUESTA,
            'seo' => ['titulo' => 'Consultar mi reclamo'],
        ]);
    }
}
