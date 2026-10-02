<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\PaginaService;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Páginas públicas: el servidor solo abre la página con su título, descripción e imagen (prop `seo`,
 * que app.blade.php pone en el HTML para Google, WhatsApp y Facebook). El contenido lo pide cada
 * página a la API: GET /api/paginas/{pagina} y GET /api/paginas/planes/{slug}.
 */
class PaginaController extends Controller
{
    /** Página de la API → componente de React que la muestra */
    private const VISTAS = [
        'inicio' => 'Web/Inicio',
        'nosotros' => 'Web/Nosotros',
        'servicios' => 'Web/Servicios',
        'requisitos' => 'Web/Requisitos',
        'como-pagar' => 'Web/ComoPagar',
        'talleres' => 'Web/Talleres',
        'beneficios' => 'Web/Beneficios',
        'soporte' => 'Web/Contacto',
        'cotizador' => 'Web/Cotizador',
        'terminos' => 'Web/Legal',
        'privacidad' => 'Web/Legal',
    ];

    public function __construct(private PaginaService $paginas) {}

    public function inicio(): Response
    {
        return $this->pagina('inicio');
    }

    public function nosotros(): Response
    {
        return $this->pagina('nosotros');
    }

    public function servicios(): Response
    {
        return $this->pagina('servicios');
    }

    /** Página de un plan: 404 real si no existe (para que Google no la indexe vacía). */
    public function plan(string $slug): Response
    {
        $seo = $this->paginas->seoPlan($slug) ?? abort(404);

        return Inertia::render('Web/Plan', ['slug' => $slug, 'seo' => $seo]);
    }

    public function requisitos(): Response
    {
        return $this->pagina('requisitos');
    }

    public function pagos(): Response
    {
        return $this->pagina('como-pagar');
    }

    public function talleres(): Response
    {
        return $this->pagina('talleres');
    }

    public function beneficios(): Response
    {
        return $this->pagina('beneficios');
    }

    public function contacto(): Response
    {
        return $this->pagina('soporte');
    }

    public function cotizador(): Response
    {
        return $this->pagina('cotizador');
    }

    public function terminos(): Response
    {
        return $this->pagina('terminos');
    }

    public function privacidad(): Response
    {
        return $this->pagina('privacidad');
    }

    /** `pagina`: lo que la página pide a la API. */
    private function pagina(string $pagina): Response
    {
        abort_unless($this->paginas->existe($pagina), 404);

        return Inertia::render(self::VISTAS[$pagina], [
            'pagina' => $pagina,
            'seo' => $this->paginas->seo($pagina),
        ]);
    }
}
