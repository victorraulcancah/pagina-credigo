<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Plan o servicio. Sus opciones del cotizador y su conteo salen solo si se cargaron. */
class ServicioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'slug' => $this->slug,
            'url' => $this->slug ? $this->url() : null,
            'etiqueta' => $this->etiqueta,
            'descripcion' => $this->descripcion,
            'detalle' => $this->detalle,
            'caracteristicas' => $this->caracteristicas ?? [],
            'icono' => $this->icono,
            'imagen_url' => $this->imagen_url,
            'video_url' => $this->video_url,
            'destacado' => (bool) $this->destacado,
            'orden' => $this->orden,
            'activo' => (bool) $this->activo,
            'opciones' => OpcionPlanResource::collection($this->whenLoaded('opciones')),
            'opciones_count' => $this->whenCounted('opciones'),
        ];
    }
}
