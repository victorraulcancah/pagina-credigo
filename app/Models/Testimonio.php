<?php

namespace App\Models;

use App\Models\Concerns\Ordenable;
use App\Services\ImagenService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Historia de un conductor que recibió su vehículo: su comentario corto (carrusel del inicio),
 * la historia completa (su página, /historias/{slug}), su foto y la de su vehículo.
 */
class Testimonio extends Model
{
    use Ordenable;

    protected $table = 'testimonios';

    protected $fillable = [
        'nombre', 'slug', 'titulo', 'ciudad', 'comentario', 'historia', 'foto', 'foto_vehiculo', 'vehiculo',
        'calificacion', 'video_url', 'autorizado', 'orden', 'activo',
    ];

    protected $appends = ['foto_url', 'foto_vehiculo_url'];

    protected function casts(): array
    {
        return [
            'calificacion' => 'integer',
            'autorizado' => 'boolean',
            'orden' => 'integer',
            'activo' => 'boolean',
        ];
    }

    /** Sin dirección escrita en el panel, se arma con el nombre ("Edimar Ríos" → edimar-rios). */
    protected static function booted(): void
    {
        static::saving(function (Testimonio $testimonio) {
            if (blank($testimonio->slug)) {
                $testimonio->slug = static::slugLibre($testimonio->nombre, $testimonio->id);
            }
        });
    }

    /** Dirección que no use otra historia: "edimar", "edimar-2"... */
    public static function slugLibre(string $nombre, ?int $ignorarId = null): string
    {
        $base = Str::limit(Str::slug($nombre), 100, '') ?: 'historia';
        $slug = $base;
        for ($i = 2; static::where('slug', $slug)->when($ignorarId, fn ($q) => $q->whereKeyNot($ignorarId))->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }

    /** Página pública de la historia. */
    public function url(): string
    {
        return "/historias/{$this->slug}";
    }

    /** Los que se ven en el sitio: visibles y con la autorización del conductor. */
    public function scopePublicado(Builder $query): Builder
    {
        return $query->activo()->where('autorizado', true);
    }

    protected function fotoUrl(): Attribute
    {
        return Attribute::get(fn () => app(ImagenService::class)->url($this->foto));
    }

    protected function fotoVehiculoUrl(): Attribute
    {
        return Attribute::get(fn () => app(ImagenService::class)->url($this->foto_vehiculo));
    }
}
