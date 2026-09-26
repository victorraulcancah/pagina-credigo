<?php

namespace App\Models\Concerns;

use App\Services\ImagenService;
use Illuminate\Database\Eloquent\Casts\Attribute;

/** Expone `imagen_url` (URL pública) a partir de la ruta guardada en `imagen`. */
trait TieneImagen
{
    public function initializeTieneImagen(): void
    {
        $this->append('imagen_url');
    }

    protected function imagenUrl(): Attribute
    {
        return Attribute::get(fn () => app(ImagenService::class)->url($this->imagen));
    }
}
