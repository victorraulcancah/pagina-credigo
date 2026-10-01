<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\MensajeContacto;
use App\Models\PreguntaFrecuente;
use App\Models\Seccion;
use App\Models\Servicio;
use App\Services\ContenidoService;
use App\Services\Erp\ComerciosErp;
use App\Services\Erp\CuponesErp;
use App\Services\Erp\TalleresErp;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Páginas públicas del sitio. Todo el contenido sale de la BD (se edita en /admin).
 * El prop `seo` lo usa app.blade.php para el título, la descripción y la vista
 * previa al compartir (WhatsApp/Facebook leen el HTML del servidor, no el JS).
 */
class PaginaController extends Controller
{
    public function __construct(private ContenidoService $contenido) {}

    public function inicio(): Response
    {
        return Inertia::render('Web/Inicio', [
            'banners' => Banner::activo()->ordenado()->get(),
            'secciones' => $this->contenido->secciones(['inicio', 'general']),
            'servicios' => Servicio::activo()->destacado()->conOpcionesActivas()->ordenado()->get(),
            'preguntas' => PreguntaFrecuente::activo()->ordenado()->get(),
            'seo' => [],
        ]);
    }

    /** Cotizador: planes visibles que tienen al menos una opción visible. */
    public function cotizador(): Response
    {
        $secciones = $this->contenido->secciones(['cotizador']);

        return Inertia::render('Web/Cotizador', [
            'secciones' => $secciones,
            'planes' => Servicio::activo()
                ->whereHas('opciones', fn ($q) => $q->activo())
                ->with(['opciones' => fn ($q) => $q->activo()->ordenado()])
                ->ordenado()
                ->get(['id', 'titulo', 'etiqueta', 'icono', 'descripcion']),
            'seo' => $this->seo('Cotizador', $secciones['cotizador.hero'] ?? null),
        ]);
    }

    public function nosotros(): Response
    {
        $secciones = $this->contenido->secciones(['nosotros', 'general']);

        return Inertia::render('Web/Nosotros', [
            'secciones' => $secciones,
            'seo' => $this->seo('Nosotros', $secciones['nosotros.hero'] ?? null),
        ]);
    }

    public function servicios(): Response
    {
        $secciones = $this->contenido->secciones(['servicios', 'general']);

        return Inertia::render('Web/Servicios', [
            'secciones' => $secciones,
            'servicios' => Servicio::activo()->conOpcionesActivas()->ordenado()->get(),
            'seo' => $this->seo('Servicios', $secciones['servicios.hero'] ?? null),
        ]);
    }

    public function requisitos(): Response
    {
        $secciones = $this->contenido->secciones(['requisitos', 'general']);

        return Inertia::render('Web/Requisitos', [
            'secciones' => $secciones,
            'seo' => $this->seo('Requisitos', $secciones['requisitos.hero'] ?? null),
        ]);
    }

    public function pagos(): Response
    {
        $secciones = $this->contenido->secciones(['pagos', 'general']);

        return Inertia::render('Web/ComoPagar', [
            'secciones' => $secciones,
            'seo' => $this->seo('Cómo pagar', $secciones['pagos.hero'] ?? null),
        ]);
    }

    public function talleres(TalleresErp $talleres): Response
    {
        $secciones = $this->contenido->secciones(['talleres', 'general']);

        return Inertia::render('Web/Talleres', [
            'secciones' => $secciones,
            'talleres' => $talleres->items(),
            'seo' => $this->seo('Talleres aliados', $secciones['talleres.hero'] ?? null),
        ]);
    }

    public function beneficios(ComerciosErp $comercios, CuponesErp $cupones): Response
    {
        $secciones = $this->contenido->secciones(['beneficios', 'general']);

        return Inertia::render('Web/Beneficios', [
            'secciones' => $secciones,
            'comercios' => $comercios->items(),
            'cupones' => $cupones->vigentes(),
            'seo' => $this->seo('Beneficios', $secciones['beneficios.hero'] ?? null),
        ]);
    }

    public function contacto(): Response
    {
        $secciones = $this->contenido->secciones(['contacto', 'general']);

        return Inertia::render('Web/Contacto', [
            'secciones' => $secciones,
            'tiposConsulta' => MensajeContacto::TIPOS_CONSULTA,
            'preguntas' => PreguntaFrecuente::activo()->ordenado()->get(),
            'seo' => $this->seo('Soporte', $secciones['contacto.hero'] ?? null),
        ]);
    }

    public function terminos(): Response
    {
        return $this->paginaLegal('terminos');
    }

    public function privacidad(): Response
    {
        return $this->paginaLegal('privacidad');
    }

    /** Páginas legales: su texto se edita en el panel (Secciones → Páginas legales). */
    private function paginaLegal(string $clave): Response
    {
        $seccion = $this->contenido->secciones(['legal'])["legal.{$clave}"] ?? abort(404);

        return Inertia::render('Web/Legal', [
            'seccion' => $seccion,
            'seo' => ['titulo' => $seccion->titulo],
        ]);
    }

    /** Título, descripción e imagen de una página a partir de su encabezado (sección hero). */
    private function seo(string $titulo, ?Seccion $hero): array
    {
        return array_filter([
            'titulo' => $titulo,
            'descripcion' => $hero?->contenido,
            'imagen' => $hero?->imagen_url,
        ]);
    }
}
