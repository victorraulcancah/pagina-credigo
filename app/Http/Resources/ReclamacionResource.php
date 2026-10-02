<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Hoja del Libro de Reclamaciones para el panel: todos sus datos (es un registro legal),
 * sin la IP (oculta en el modelo). Sus adjuntos salen sin la ruta del disco privado.
 */
class ReclamacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            ...collect(parent::toArray($request))->except(['adjuntos', 'respondido_por'])->all(),
            // Quién respondió: { id, name } si se cargó la relación (el panel muestra su nombre)
            'respondido_por_id' => $this->getAttribute('respondido_por'),
            'respondido_por' => $this->whenLoaded('respondidoPor', fn () => $this->respondidoPor?->only(['id', 'name'])),
            'adjuntos' => ReclamacionAdjuntoResource::collection($this->whenLoaded('adjuntos')),
        ];
    }
}
