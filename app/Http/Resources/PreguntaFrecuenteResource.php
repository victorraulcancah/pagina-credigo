<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PreguntaFrecuenteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'pregunta' => $this->pregunta,
            'respuesta' => $this->respuesta,
            'orden' => $this->orden,
            'activo' => (bool) $this->activo,
        ];
    }
}
