<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** PDF descargable. La ruta en el disco no sale: solo su URL pública y su peso. */
class DocumentoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'categoria' => $this->categoria,
            'servicio_id' => $this->servicio_id,
            'archivo_url' => $this->archivo_url,
            'tamano' => $this->tamano,
            'orden' => $this->orden,
            'activo' => (bool) $this->activo,
            'servicio' => $this->whenLoaded('servicio', fn () => $this->servicio?->only(['id', 'titulo'])),
        ];
    }
}
