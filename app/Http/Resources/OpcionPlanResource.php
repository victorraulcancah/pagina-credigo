<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Opción del cotizador de un plan: montos referenciales (inicial, cuota y n.º de cuotas). */
class OpcionPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'servicio_id' => $this->servicio_id,
            'erp_ref' => $this->erp_ref,
            'nombre' => $this->nombre,
            'nota' => $this->nota,
            'moneda' => $this->moneda,
            'inicial' => $this->inicial,
            'cuota' => $this->cuota,
            'numero_cuotas' => $this->numero_cuotas,
            'frecuencia' => $this->frecuencia,
            'orden' => $this->orden,
            'activo' => (bool) $this->activo,
        ];
    }
}
