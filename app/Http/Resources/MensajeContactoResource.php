<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Solicitud de la bandeja del panel (contacto o cotizador). La IP no sale. */
class MensajeContactoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'apellido' => $this->apellido,
            'nombre_completo' => $this->nombre_completo,
            'telefono' => $this->telefono,
            'email' => $this->email,
            'tipo_consulta' => $this->tipo_consulta,
            'tipo_consulta_texto' => $this->tipo_consulta_texto,
            'asunto' => $this->asunto,
            'mensaje' => $this->mensaje,
            'origen' => $this->origen,
            'estado' => $this->estado,
            'asignado_a' => $this->asignado_a,
            'asignado' => $this->whenLoaded('asignado', fn () => $this->asignado?->only(['id', 'name'])),
            'notas' => $this->notas,
            'leido_at' => $this->leido_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
