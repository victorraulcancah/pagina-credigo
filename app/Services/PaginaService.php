<?php

namespace App\Services;

use App\Http\Resources\BannerResource;
use App\Http\Resources\DocumentoResource;
use App\Http\Resources\PreguntaFrecuenteResource;
use App\Http\Resources\ServicioResource;
use App\Models\MensajeContacto;
use App\Models\Reclamacion;
use App\Models\Servicio;
use App\Services\Erp\ComerciosErp;
use App\Services\Erp\CuponesErp;
use App\Services\Erp\TalleresErp;

/**
 * Contenido de cada página pública del sitio, tal como lo entrega la API (GET /api/paginas/{pagina}).
 * Aparte, `seo()` arma el título, la descripción y la imagen que el servidor pone en el HTML
 * (Google, WhatsApp y Facebook leen eso sin ejecutar JavaScript).
 */
class PaginaService
{
    /** página => [páginas de secciones que usa, sección de encabezado, título por defecto] */
    public const PAGINAS = [
        'inicio' => [['inicio', 'general'], null, null],
        'nosotros' => [['nosotros', 'general'], 'nosotros.hero', 'Nosotros'],
        'servicios' => [['servicios', 'general'], 'servicios.hero', 'Servicios'],
        'requisitos' => [['requisitos', 'general'], 'requisitos.hero', 'Requisitos'],
        'como-pagar' => [['pagos', 'general'], 'pagos.hero', 'Cómo pagar'],
        'talleres' => [['talleres', 'general'], 'talleres.hero', 'Talleres aliados'],
        'beneficios' => [['beneficios', 'general'], 'beneficios.hero', 'Beneficios'],
        'soporte' => [['contacto', 'general'], 'contacto.hero', 'Soporte'],
        'cotizador' => [['cotizador'], 'cotizador.hero', 'Cotizador'],
        'terminos' => [['legal'], null, null],
        'privacidad' => [['legal'], null, null],
        'libro-de-reclamaciones' => [[], null, 'Libro de Reclamaciones'],
        'consultar-reclamo' => [[], null, 'Consultar mi reclamo'],
    ];

    public function __construct(
        private SeccionService $secciones,
        private ServicioService $servicios,
        private DocumentoService $documentos,
        private PreguntaFrecuenteService $preguntas,
        private BannerService $banners,
    ) {}

    public function existe(string $pagina): bool
    {
        return array_key_exists($pagina, self::PAGINAS) && (! in_array($pagina, ['terminos', 'privacidad'], true) || $this->seccionLegal($pagina));
    }

    /** Todo lo que muestra una página, o null si la página no existe. */
    public function contenido(string $pagina): ?array
    {
        if (! $this->existe($pagina)) {
            return null;
        }

        $secciones = $this->secciones->publicas(self::PAGINAS[$pagina][0]);

        return match ($pagina) {
            'inicio' => [
                'banners' => BannerResource::collection($this->banners->activos())->resolve(),
                'secciones' => $secciones,
                // Los destacados, con sus opciones visibles: "Cuota desde S/ X por semana"
                'servicios' => ServicioResource::collection($this->servicios->visibles(soloDestacados: true))->resolve(),
                'preguntas' => $this->preguntasActivas(),
            ],
            'nosotros' => ['secciones' => $secciones],
            'servicios' => [
                'secciones' => $secciones,
                'servicios' => ServicioResource::collection($this->servicios->visibles())->resolve(),
                // Fichas generales en PDF (las de un plan están en la página de ese plan)
                'documentos' => $this->documentosPublicos('planes', false),
            ],
            'requisitos' => ['secciones' => $secciones, 'documentos' => $this->documentosPublicos('requisitos')],
            'como-pagar' => ['secciones' => $secciones, 'documentos' => $this->documentosPublicos('pagos')],
            'talleres' => [
                'secciones' => $secciones,
                'talleres' => app(TalleresErp::class)->items(),
                'documentos' => $this->documentosPublicos('talleres'),
            ],
            'beneficios' => [
                'secciones' => $secciones,
                // Franja "Tu semana": el lunes muestra "cuota desde" con el monto real más bajo
                'cuota_semanal' => $this->servicios->cuotaSemanalMasBaja(),
                'comercios' => app(ComerciosErp::class)->items(),
                'cupones' => app(CuponesErp::class)->vigentes(),
            ],
            'soporte' => [
                'secciones' => $secciones,
                'tipos_consulta' => MensajeContacto::TIPOS_CONSULTA,
                'preguntas' => $this->preguntasActivas(),
            ],
            'cotizador' => [
                'secciones' => $secciones,
                'planes' => ServicioResource::collection($this->servicios->cotizables())->resolve(),
            ],
            'terminos', 'privacidad' => [
                'seccion' => $this->seccionLegal($pagina),
                'documentos' => $this->documentosPublicos('legal'),
            ],
            'libro-de-reclamaciones' => [
                'tipos_documento' => Reclamacion::TIPOS_DOCUMENTO,
                'tipos_comprobante' => Reclamacion::TIPOS_COMPROBANTE,
                'soluciones' => Reclamacion::SOLUCIONES,
                'dias_respuesta' => Reclamacion::DIAS_HABILES_RESPUESTA,
            ],
            'consultar-reclamo' => ['dias_respuesta' => Reclamacion::DIAS_HABILES_RESPUESTA],
        };
    }

    /** Página de un plan visible (por su dirección), o null si no existe o está oculto. */
    public function plan(string $slug): ?array
    {
        $servicio = $this->servicios->publicoPorSlug($slug);

        if (! $servicio) {
            return null;
        }

        return [
            'secciones' => $this->secciones->publicas(['requisitos', 'general']),
            'servicio' => (new ServicioResource($servicio))->resolve(),
            'documentos' => $this->documentosPublicos('planes', $servicio->id),
            'otros' => ServicioResource::collection($this->servicios->otros($servicio))->resolve(),
        ];
    }

    /** Título, descripción e imagen para el HTML del servidor (vista previa al compartir y buscadores). */
    public function seo(string $pagina): array
    {
        [$paginas, $encabezado, $titulo] = self::PAGINAS[$pagina];

        if (in_array($pagina, ['terminos', 'privacidad'], true)) {
            return ['titulo' => $this->seccionLegal($pagina)['titulo'] ?? null];
        }

        $hero = $encabezado ? ($this->secciones->publicas($paginas)[$encabezado] ?? null) : null;

        return array_filter([
            'titulo' => $titulo,
            'descripcion' => $hero['contenido'] ?? null,
            'imagen' => $hero['imagen_url'] ?? null,
        ]);
    }

    public function seoPlan(string $slug): ?array
    {
        $servicio = Servicio::activo()->where('slug', $slug)->first(['titulo', 'descripcion', 'imagen']);

        return $servicio ? array_filter([
            'titulo' => $servicio->titulo,
            'descripcion' => $servicio->descripcion,
            'imagen' => $servicio->imagen_url,
        ]) : null;
    }

    private function seccionLegal(string $pagina): ?array
    {
        return $this->secciones->publicas(['legal'])["legal.{$pagina}"] ?? null;
    }

    private function documentosPublicos(string $categoria, int|false|null $servicioId = null): array
    {
        return DocumentoResource::collection($this->documentos->publicos($categoria, $servicioId))->resolve();
    }

    private function preguntasActivas(): array
    {
        return PreguntaFrecuenteResource::collection($this->preguntas->activas())->resolve();
    }
}
