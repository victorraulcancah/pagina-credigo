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

    protected $table = 'testimonios';

    protected $fillable = [
        'nombre', 'ciudad', 'comentario', 'foto', 'foto_vehiculo', 'vehiculo',
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
