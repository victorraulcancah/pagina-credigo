<?php

namespace App\Http\Controllers\Api;

use App\Services\PaginaService;
use Illuminate\Http\JsonResponse;

/**
 * Contenido de las páginas públicas del sitio: todo lo que muestra cada una en una sola respuesta
 * (secciones del panel, planes, documentos, preguntas y datos del ERP).
 */
class PaginaController extends BaseApiController
{
    public function __construct(private PaginaService $paginas) {}

    /** GET /api/paginas/{pagina}: inicio, nosotros, servicios, requisitos, como-pagar, talleres, beneficios… */
    public function show(string $pagina): JsonResponse
    {
        $contenido = $this->paginas->contenido($pagina);

        return $contenido === null
            ? $this->notFoundResponse('Esa página no existe')
            : $this->successResponse($contenido, 'Página');
    }

    /** GET /api/paginas/planes/{slug}: la página de un plan. */
    public function plan(string $slug): JsonResponse
    {
        $contenido = $this->paginas->plan($slug);

        return $contenido === null
            ? $this->notFoundResponse('Ese plan no existe o no está disponible')
            : $this->successResponse($contenido, 'Plan');
    }
}
