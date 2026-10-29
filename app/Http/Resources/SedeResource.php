<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Oficina de la empresa. */
class SedeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ciudad' => $this->ciudad,
            'nombre' => $this->nombre,
            'direccion' => $this->direccion,
            'telefono' => $this->telefono,
            'horario' => $this->horario,
            'mapa_url' => $this->mapa_url,
            'orden' => $this->orden,
            'activo' => (bool) $this->activo,
        ];
    }
}
