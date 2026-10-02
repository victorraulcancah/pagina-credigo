<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Lo que ve el consumidor al consultar su hoja: estado, plazo y respuesta (sin sus datos personales). */
class ReclamacionEstadoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'codigo' => $this->codigo,
            'tipo' => $this->tipo,
            'estado' => $this->estado,
            'created_at' => $this->created_at,
            'fecha_limite' => $this->fecha_limite,
            'vencido' => $this->vencido,
            'respuesta' => $this->respuesta,
            'respondido_at' => $this->respondido_at,
        ];
    }
}
