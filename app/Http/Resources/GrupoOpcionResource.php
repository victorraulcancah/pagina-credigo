<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Sección de opciones de un plan (título y logo; la ruta del archivo no sale, solo su URL). */
class GrupoOpcionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'servicio_id' => $this->servicio_id,
            'titulo' => $this->titulo,
            'imagen_url' => $this->imagen_url,
            'orden' => $this->orden,
        ];
    }
}
