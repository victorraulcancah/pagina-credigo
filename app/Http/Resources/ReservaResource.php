<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Reserva para el panel. La IP no sale. */
class ReservaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tipo_reserva_id' => $this->tipo_reserva_id,
            'tipo' => $this->tipo,
            'nombre' => $this->nombre,
            'telefono' => $this->telefono,
            'origen' => $this->origen,
            'destino' => $this->destino,
            'fecha' => $this->fecha?->format('Y-m-d'),
            'hora' => $this->hora,
            'pasajeros' => $this->pasajeros,
            'comentario' => $this->comentario,
            'estado' => $this->estado,
            'notas' => $this->notas,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
