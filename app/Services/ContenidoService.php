<?php

namespace App\Services;

use App\Models\Seccion;

class ContenidoService
{
    /**
     * Secciones activas de las páginas indicadas, indexadas por "pagina.clave"
     * (ej. $secciones['nosotros.mision']). Si una sección está desactivada no
     * viene en el arreglo y la página no la muestra.
     */
    public function secciones(array $paginas): array
    {
        return Seccion::porPagina($paginas)
            ->activo()
            ->ordenado()
            ->get()
            ->keyBy(fn (Seccion $seccion) => "{$seccion->pagina}.{$seccion->clave}")
            ->all();
    }
}
