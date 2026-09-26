<?php

namespace App\Models;

use App\Models\Concerns\Ordenable;
use App\Models\Concerns\TieneImagen;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    use Ordenable, TieneImagen;

    protected $table = 'servicios';

    protected $fillable = ['titulo', 'descripcion', 'icono', 'imagen', 'destacado', 'orden', 'activo'];

    protected function casts(): array
    {
        return [
            'destacado' => 'boolean',
            'orden' => 'integer',
            'activo' => 'boolean',
        ];
    }

    public function scopeDestacado(Builder $query): Builder
    {
        return $query->where('destacado', true);
    }
}
