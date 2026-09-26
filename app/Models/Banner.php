<?php

namespace App\Models;

use App\Models\Concerns\Ordenable;
use App\Models\Concerns\TieneImagen;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use Ordenable, TieneImagen;

    protected $table = 'banners';

    protected $fillable = ['titulo', 'subtitulo', 'imagen', 'boton_texto', 'boton_url', 'orden', 'activo'];

    protected function casts(): array
    {
        return [
            'orden' => 'integer',
            'activo' => 'boolean',
        ];
    }
}
