<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Categoría del blog (con cuántos artículos tiene, en el panel). */
class CategoriaBlogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'slug' => $this->slug,
            'orden' => $this->orden,
            'articulos_count' => $this->whenCounted('articulos'),
        ];
    }
}
