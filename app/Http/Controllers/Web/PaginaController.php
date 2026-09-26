<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\PreguntaFrecuente;
use App\Models\Servicio;
use App\Services\ContenidoService;
use Inertia\Inertia;
use Inertia\Response;

/** Páginas públicas del sitio. Todo el contenido sale de la BD (se edita en /admin). */
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
        ]);
    }

    /** Cotizador: planes visibles que tienen al menos una opción visible. */
    public function cotizador(): Response
    {
        $opcionesActivas = fn ($q) => $q->activo();

        return Inertia::render('Web/Cotizador', [
            'secciones' => $this->contenido->secciones(['cotizador']),
            'planes' => Servicio::activo()
                ->whereHas('opciones', $opcionesActivas)
                ->with(['opciones' => fn ($q) => $q->activo()->ordenado()])
                ->ordenado()
                ->get(['id', 'titulo', 'etiqueta', 'icono', 'descripcion']),
        ]);
    }

    public function nosotros(): Response
    {
        return Inertia::render('Web/Nosotros', [
            'secciones' => $this->contenido->secciones(['nosotros', 'general']),
        ]);
    }

    public function servicios(): Response
    {
        return Inertia::render('Web/Servicios', [
            'secciones' => $this->contenido->secciones(['servicios', 'general']),
            'servicios' => Servicio::activo()->conOpcionesActivas()->ordenado()->get(),
        ]);
    }

    public function contacto(): Response
    {
        return Inertia::render('Web/Contacto', [
            'secciones' => $this->contenido->secciones(['contacto', 'general']),
            'servicios' => Servicio::activo()->ordenado()->pluck('titulo'),
            'preguntas' => PreguntaFrecuente::activo()->ordenado()->get(),
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

        return Inertia::render('Web/Legal', ['seccion' => $seccion]);
    }
}
