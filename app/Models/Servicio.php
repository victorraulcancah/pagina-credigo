<?php

namespace App\Models;

use App\Models\Concerns\Ordenable;
use App\Models\Concerns\TieneImagen;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Servicio extends Model
{
    use Ordenable, TieneImagen;

    protected $table = 'servicios';

    protected $fillable = ['titulo', 'slug', 'etiqueta', 'descripcion', 'detalle', 'caracteristicas', 'icono', 'imagen', 'video_url', 'destacado', 'orden', 'activo'];

    protected function casts(): array
    {
        return [
            'caracteristicas' => 'array',
            'destacado' => 'boolean',
            'orden' => 'integer',
            'activo' => 'boolean',
        ];
    }

    /** Sin dirección escrita en el panel, se arma con el nombre del plan ("Credi Motos" → credi-motos). */
    protected static function booted(): void
    {
        static::saving(function (Servicio $servicio) {
            if (blank($servicio->slug)) {
                $servicio->slug = static::slugLibre($servicio->titulo, $servicio->id);
            }
        });
    }

    /** Dirección que no use otro plan: "credi-motos", "credi-motos-2"... */
    public static function slugLibre(string $titulo, ?int $ignorarId = null): string
    {
        $base = Str::limit(Str::slug($titulo), 100, '') ?: 'plan';
        $slug = $base;
        for ($i = 2; static::where('slug', $slug)->when($ignorarId, fn ($q) => $q->whereKeyNot($ignorarId))->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }

    /** Página pública del plan. */
    public function url(): string
    {
        return "/servicios/{$this->slug}";
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
