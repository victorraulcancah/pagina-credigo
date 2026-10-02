<?php

namespace App\Models;

use App\Models\Concerns\Ordenable;
use App\Models\Concerns\TieneImagen;
use App\Services\ImagenService;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use Ordenable, TieneImagen;

    protected $table = 'banners';

    protected $fillable = [
        'etiqueta', 'titulo', 'subtitulo', 'imagen', 'solo_imagen', 'imagen_movil',
        'boton_texto', 'boton_url', 'boton2_texto', 'boton2_url', 'video_url', 'orden', 'activo',
    ];

    protected $appends = ['imagen_movil_url'];

    protected function casts(): array
    {
        return [
            'solo_imagen' => 'boolean',
            'orden' => 'integer',
            'activo' => 'boolean',
        ];
    }

    protected function imagenMovilUrl(): Attribute
    {
        return Attribute::get(fn () => app(ImagenService::class)->url($this->imagen_movil));
    }
}
