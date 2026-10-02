<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Reclamacion;
use App\Services\PaginaService;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

/** Pantallas del Libro de Reclamaciones. Sus datos, registrar y consultar van por la API (/api/...). */
class LibroReclamacionesController extends Controller
{
    public function __construct(private PaginaService $paginas) {}

    public function create(): Response
    {
        return Inertia::render('Web/LibroReclamaciones', [
            'pagina' => 'libro-de-reclamaciones',
            'seo' => [
                'titulo' => 'Libro de Reclamaciones',
                'descripcion' => 'Registra tu reclamo o queja en nuestro Libro de Reclamaciones virtual.',
            ],
        ]);
    }

    /**
     * Constancia de la hoja. Esta dirección es firmada (solo la tiene quien registró la hoja) y la
     * página pide los datos a una dirección de la API también firmada, que vence en 2 horas.
     */
    public function constancia(Reclamacion $reclamacion): Response
    {
        return Inertia::render('Web/ReclamacionConstancia', [
            'datosUrl' => URL::temporarySignedRoute('api.reclamaciones.constancia', now()->addHours(2), $reclamacion),
            'seo' => ['titulo' => "Hoja de reclamación N.° {$reclamacion->codigo}"],
        ]);
    }

    public function consultar(): Response
    {
        return Inertia::render('Web/ConsultarReclamacion', [
            'pagina' => 'consultar-reclamo',
            'seo' => $this->paginas->seo('consultar-reclamo'),
        ]);
    }
}
