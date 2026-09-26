<?php

namespace App\Models;

use App\Models\Concerns\Ordenable;
use App\Models\Concerns\TieneImagen;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Servicio extends Model
{
    use Ordenable, TieneImagen;

    protected $table = 'servicios';

    protected $fillable = ['titulo', 'etiqueta', 'descripcion', 'caracteristicas', 'icono', 'imagen', 'destacado', 'orden', 'activo'];

    protected function casts(): array
    {
        return [
            'caracteristicas' => 'array',
            'destacado' => 'boolean',
            'orden' => 'integer',
            'activo' => 'boolean',
        ];
    }

    public function scopeDestacado(Builder $query): Builder
    {
        return $query->where('destacado', true);
    }

    /** Opciones del cotizador de este plan. */
    public function opciones(): HasMany
    {
        return $this->hasMany(OpcionPlan::class);
    }

    /** Cuenta las opciones visibles del cotizador (para mostrar el enlace "Cotizar"). */
    public function scopeConOpcionesActivas(Builder $query): Builder
    {
        return $query->withCount(['opciones' => fn (Builder $q) => $q->activo()]);
    }
}
