<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Tipo de reserva. Cuántas reservas tiene, el orden y si está visible solo los ve el panel. */
class TipoReservaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'slug' => $this->slug,
            'descripcion' => $this->descripcion,
            'pide_ruta' => (bool) $this->pide_ruta,
            $this->mergeWhen($request->is('api/admin/*'), fn () => [
                'orden' => $this->orden,
                'activo' => (bool) $this->activo,
                'reservas_count' => $this->whenCounted('reservas'),
            ]),
        ];
    }
}
