<?php

namespace App\Models;

use App\Models\Concerns\Ordenable;
use App\Services\ImagenService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

/** Historia de un conductor que recibió su vehículo: su comentario, foto y la de su vehículo. */
class Testimonio extends Model
{
    use Ordenable;

    /** Proporciones de la foto en la página Historias; la primera es la de siempre y `original` no la recorta. */
    public const TAMANOS_FOTO = ['horizontal', 'cuadrada', 'vertical', 'original'];

    /** Ancho de la tarjeta en la página Historias: pequeña (3 por fila), mediana (2) o grande (fila completa). */
    public const TAMANOS_TARJETA = ['pequena', 'mediana', 'grande'];

    protected $table = 'testimonios';

    protected $attributes = ['tamano_foto' => 'horizontal', 'tamano_tarjeta' => 'mediana'];

    protected $fillable = [
        'nombre', 'ciudad', 'comentario', 'foto', 'foto_vehiculo', 'tamano_foto', 'tamano_tarjeta', 'vehiculo',
        'calificacion', 'tiktok_url', 'youtube_url', 'facebook_url', 'video', 'autorizado', 'orden', 'activo',
    ];

    protected $appends = ['foto_url', 'foto_vehiculo_url', 'video_archivo_url'];

    protected function casts(): array
    {
        return [
            'calificacion' => 'integer',
            'autorizado' => 'boolean',
            'orden' => 'integer',
            'activo' => 'boolean',
        ];
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

    /** Video subido: se ve dentro de la historia (los de TikTok, YouTube y Facebook van como íconos). */
    protected function videoArchivoUrl(): Attribute
    {
        return Attribute::get(fn () => app(ImagenService::class)->url($this->video));
    }
}
