<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Bloque de contenido de una página (se edita en el panel → Secciones). */
class SeccionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'pagina' => $this->pagina,
            'clave' => $this->clave,
            'nombre' => $this->nombre,
            'campos' => $this->campos ?? [],
            'subtitulo' => $this->subtitulo,
            'titulo' => $this->titulo,
            'contenido' => $this->contenido,
            'imagen_url' => $this->imagen_url,
            'boton_texto' => $this->boton_texto,
            'boton_url' => $this->boton_url,
            'video_url' => $this->video_url,
            'items' => $this->items ?? [],
            'activo' => (bool) $this->activo,
            'updated_at' => $this->updated_at,
        ];
    }
}
