<?php

namespace App\Models;

use App\Models\Concerns\TieneImagen;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Sección de la lista de opciones de un plan, con su título y logo (`imagen`). */
class GrupoOpcion extends Model
{
    use TieneImagen;

    protected $table = 'grupos_opcion';

    protected $fillable = ['servicio_id', 'titulo', 'imagen', 'orden'];

    protected function casts(): array
    {
        return ['orden' => 'integer'];
    }

    public function scopeOrdenado(Builder $query): Builder
    {
        return $query->orderBy('orden')->orderBy('id');
    }

    public function servicio(): BelongsTo
    {
        return $this->belongsTo(Servicio::class);
    }

    public function opciones(): HasMany
    {
        return $this->hasMany(OpcionPlan::class, 'grupo_opcion_id');
    }
}
