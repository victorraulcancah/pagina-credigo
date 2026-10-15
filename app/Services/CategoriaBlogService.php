<?php

namespace App\Services;

use App\Models\CategoriaBlog;
use Illuminate\Database\Eloquent\Collection;

/** Categorías del blog. Al borrar una, sus artículos quedan sin categoría (no se borran). */
class CategoriaBlogService
{
    /** Todas, con cuántos artículos tiene cada una (para el panel). */
    public function listar(): Collection
    {
        return CategoriaBlog::withCount('articulos')->orderBy('orden')->orderBy('nombre')->get();
    }

    /** Las que tienen artículos visibles (para el filtro de /blog). */
    public function conArticulos(): Collection
    {
        return CategoriaBlog::whereHas('articulos', fn ($q) => $q->visible())->orderBy('orden')->orderBy('nombre')->get(['id', 'nombre', 'slug']);
    }

    public function crear(array $datos): CategoriaBlog
    {
        return CategoriaBlog::create($datos);
    }

    public function actualizar(CategoriaBlog $categoria, array $datos): CategoriaBlog
    {
        $categoria->update($datos);

        return $categoria->refresh();
    }

    public function eliminar(CategoriaBlog $categoria): void
    {
        $categoria->delete();
    }
}
