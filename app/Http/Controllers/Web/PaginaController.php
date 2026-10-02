<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\BannerResource;
use App\Http\Resources\DocumentoResource;
use App\Http\Resources\PreguntaFrecuenteResource;
use App\Http\Resources\ServicioResource;
use App\Models\MensajeContacto;
use App\Services\BannerService;
use App\Services\DocumentoService;
use App\Services\Erp\ComerciosErp;
use App\Services\Erp\CuponesErp;
use App\Services\Erp\TalleresErp;
use App\Services\PreguntaFrecuenteService;
use App\Services\SeccionService;
use App\Services\ServicioService;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Páginas públicas del sitio. Los datos salen de los mismos Services y Resources que la API,
 * pero llegan con la página desde el servidor: el prop `seo` lo usa app.blade.php para el título,
 * la descripción y la vista previa al compartir (WhatsApp/Facebook leen el HTML, no el JS).
 */
class PaginaController extends Controller
{
    public function __construct(
        private SeccionService $secciones,
        private ServicioService $servicios,
        private DocumentoService $documentos,
        private PreguntaFrecuenteService $preguntas,
    ) {}

    public function inicio(BannerService $banners): Response
    {
        return Inertia::render('Web/Inicio', [
            'banners' => BannerResource::collection($banners->activos())->resolve(),
            'secciones' => $this->secciones->publicas(['inicio', 'general']),
            // Los destacados, con sus opciones visibles: "Cuota desde S/ X por semana"
            'servicios' => ServicioResource::collection($this->servicios->visibles(soloDestacados: true))->resolve(),
            'preguntas' => PreguntaFrecuenteResource::collection($this->preguntas->activas())->resolve(),
            'seo' => [],
        ]);
    }

    /** Cotizador: planes visibles que tienen al menos una opción visible. */
    public function cotizador(): Response
    {
        $secciones = $this->secciones->publicas(['cotizador']);

        return Inertia::render('Web/Cotizador', [
            'secciones' => $secciones,
            'planes' => ServicioResource::collection($this->servicios->cotizables())->resolve(),
            'seo' => $this->seo('Cotizador', $secciones['cotizador.hero'] ?? null),
        ]);
    }

    public function nosotros(): Response
    {
        $secciones = $this->secciones->publicas(['nosotros', 'general']);

        return Inertia::render('Web/Nosotros', [
            'secciones' => $secciones,
            'seo' => $this->seo('Nosotros', $secciones['nosotros.hero'] ?? null),
        ]);
    }

    public function servicios(): Response
    {
        $secciones = $this->secciones->publicas(['servicios', 'general']);

        return Inertia::render('Web/Servicios', [
            'secciones' => $secciones,
            'servicios' => ServicioResource::collection($this->servicios->visibles())->resolve(),
            // Fichas generales en PDF (las de un plan están en la página de ese plan)
            'documentos' => DocumentoResource::collection($this->documentos->publicos('planes', false))->resolve(),
            'seo' => $this->seo('Servicios', $secciones['servicios.hero'] ?? null),
        ]);
    }

    /** Página de un plan: qué incluye, sus opciones del cotizador, detalle, ficha en PDF y video. */
    public function plan(string $slug): Response
    {
        $servicio = $this->servicios->publicoPorSlug($slug) ?? abort(404);

        return Inertia::render('Web/Plan', [
            'secciones' => $this->secciones->publicas(['requisitos', 'general']),
            'servicio' => (new ServicioResource($servicio))->resolve(),
            'documentos' => DocumentoResource::collection($this->documentos->publicos('planes', $servicio->id))->resolve(),
            'otros' => ServicioResource::collection($this->servicios->otros($servicio))->resolve(),
            'seo' => array_filter([
                'titulo' => $servicio->titulo,
                'descripcion' => $servicio->descripcion,
                'imagen' => $servicio->imagen_url,
            ]),
        ]);
    }

    public function requisitos(): Response
    {
        $secciones = $this->secciones->publicas(['requisitos', 'general']);

        return Inertia::render('Web/Requisitos', [
            'secciones' => $secciones,
            'documentos' => DocumentoResource::collection($this->documentos->publicos('requisitos'))->resolve(),
            'seo' => $this->seo('Requisitos', $secciones['requisitos.hero'] ?? null),
        ]);
    }

    public function pagos(): Response
    {
        $secciones = $this->secciones->publicas(['pagos', 'general']);

        return Inertia::render('Web/ComoPagar', [
            'secciones' => $secciones,
            'documentos' => DocumentoResource::collection($this->documentos->publicos('pagos'))->resolve(),
            'seo' => $this->seo('Cómo pagar', $secciones['pagos.hero'] ?? null),
        ]);
    }

    public function talleres(TalleresErp $talleres): Response
    {
        $secciones = $this->secciones->publicas(['talleres', 'general']);

        return Inertia::render('Web/Talleres', [
            'secciones' => $secciones,
            'talleres' => $talleres->items(),
            'documentos' => DocumentoResource::collection($this->documentos->publicos('talleres'))->resolve(),
            'seo' => $this->seo('Talleres aliados', $secciones['talleres.hero'] ?? null),
        ]);
    }

    public function beneficios(ComerciosErp $comercios, CuponesErp $cupones): Response
    {
        $secciones = $this->secciones->publicas(['beneficios', 'general']);

        return Inertia::render('Web/Beneficios', [
            'secciones' => $secciones,
            // Franja "Tu semana": el lunes muestra "cuota desde" con el monto real más bajo
            'cuotaSemanal' => $this->servicios->cuotaSemanalMasBaja(),
            'comercios' => $comercios->items(),
            'cupones' => $cupones->vigentes(),
            'seo' => $this->seo('Beneficios', $secciones['beneficios.hero'] ?? null),
        ]);
    }

    public function contacto(): Response
    {
        $secciones = $this->secciones->publicas(['contacto', 'general']);

        return Inertia::render('Web/Contacto', [
            'secciones' => $secciones,
            'tiposConsulta' => MensajeContacto::TIPOS_CONSULTA,
            'preguntas' => PreguntaFrecuenteResource::collection($this->preguntas->activas())->resolve(),
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
        $seccion = $this->secciones->publicas(['legal'])["legal.{$clave}"] ?? abort(404);

        return Inertia::render('Web/Legal', [
            'seccion' => $seccion,
            'documentos' => DocumentoResource::collection($this->documentos->publicos('legal'))->resolve(),
            'seo' => ['titulo' => $seccion['titulo']],
        ]);
    }

    /** Título, descripción e imagen de una página a partir de su encabezado (sección hero). */
    private function seo(string $titulo, ?array $hero): array
    {
        return array_filter([
            'titulo' => $titulo,
            'descripcion' => $hero['contenido'] ?? null,
            'imagen' => $hero['imagen_url'] ?? null,
        ]);
    }
}
