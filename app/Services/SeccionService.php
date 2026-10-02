<?php

namespace App\Services;

use App\Http\Resources\SeccionResource;
use App\Models\Seccion;
use Illuminate\Support\Collection;

/**
 * Secciones de contenido de las páginas. Son fijas (las crea el seeder porque cada una
 * tiene su lugar en una página): desde el panel solo se editan o se ocultan.
 */
class SeccionService
{
    private const CAMPOS_TEXTO = ['subtitulo', 'titulo', 'contenido'];

    /** Orden de las páginas en el panel */
    private const ORDEN_PAGINAS = ['inicio', 'nosotros', 'servicios', 'requisitos', 'pagos', 'talleres', 'beneficios', 'cotizador', 'contacto', 'general', 'legal'];

    public function __construct(private ImagenService $imagenes) {}

    /**
     * Secciones activas de las páginas indicadas, ya transformadas e indexadas por
     * "pagina.clave" (ej. $secciones['nosotros.mision']). Una sección desactivada no viene.
     */
    public function publicas(array $paginas): array
    {
        return Seccion::porPagina($paginas)
            ->activo()
            ->ordenado()
            ->get()
            ->mapWithKeys(fn (Seccion $seccion) => ["{$seccion->pagina}.{$seccion->clave}" => (new SeccionResource($seccion))->resolve()])
            ->all();
    }

    /** Lista del panel, agrupable por página. */
    public function paraPanel(): Collection
    {
        return Seccion::ordenado()
            ->get(['id', 'pagina', 'clave', 'nombre', 'titulo', 'activo', 'updated_at'])
            ->sortBy(fn (Seccion $seccion) => array_search($seccion->pagina, self::ORDEN_PAGINAS))
            ->values();
    }

    /** Guarda solo los campos que la sección usa (el resto se ignora). */
    public function actualizar(Seccion $seccion, array $datos): Seccion
    {
        $cambios = ['activo' => filter_var($datos['activo'] ?? false, FILTER_VALIDATE_BOOLEAN)];

        foreach (self::CAMPOS_TEXTO as $campo) {
            if ($seccion->usaCampo($campo)) {
                $cambios[$campo] = $datos[$campo] ?? null;
            }
        }

        if ($seccion->usaCampo('boton')) {
            $cambios['boton_texto'] = $datos['boton_texto'] ?? null;
            $cambios['boton_url'] = $datos['boton_url'] ?? null;
        }

        if ($seccion->usaCampo('video')) {
            $cambios['video_url'] = $datos['video_url'] ?? null;
        }

        if ($seccion->usaCampo('items')) {
            // Si se borran todos los elementos, el campo no llega en el formulario
            $cambios['items'] = array_values($datos['items'] ?? []);
        }

        if ($seccion->usaCampo('imagen')) {
            $cambios = [...$cambios, ...$this->imagenes->resolver($datos, $seccion->imagen, 'secciones')];
        }

        $seccion->update($cambios);

        return $seccion->refresh();
    }
}
