<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Foto, comprobante o video de una hoja de reclamación (se ve solo desde el panel). */
class ReclamacionAdjuntoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tipo' => $this->tipo,
            'nombre_original' => $this->nombre_original,
            'mime' => $this->mime,
            'tamano' => $this->tamano,
        ];
    }
}
