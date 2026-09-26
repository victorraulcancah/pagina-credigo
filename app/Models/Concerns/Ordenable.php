<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

/** Scopes comunes para contenido con columnas `activo` y `orden`. */
trait Ordenable
{
    public function scopeActivo(Builder $query): Builder
    {
        return $query->where('activo', true);
    }

    public function scopeOrdenado(Builder $query): Builder
    {
        return $query->orderBy('orden')->orderBy('id');
    }
}
