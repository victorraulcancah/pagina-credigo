<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Banner del carrusel del inicio (las rutas de archivo no salen: solo sus URLs). */
class BannerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'etiqueta' => $this->etiqueta,
            'titulo' => $this->titulo,
            'subtitulo' => $this->subtitulo,
            'imagen_url' => $this->imagen_url,
            'imagen_movil_url' => $this->imagen_movil_url,
            'solo_imagen' => (bool) $this->solo_imagen,
            'boton_texto' => $this->boton_texto,
            'boton_url' => $this->boton_url,
            'boton2_texto' => $this->boton2_texto,
            'boton2_url' => $this->boton2_url,
            'video_url' => $this->video_url,
            'orden' => $this->orden,
            'activo' => (bool) $this->activo,
        ];
    }
}
