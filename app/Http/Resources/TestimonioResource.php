<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Historia de un conductor (las rutas de archivo no salen: solo sus URLs).
 * La autorización, el orden y si está visible solo los ve el panel.
 */
class TestimonioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'ciudad' => $this->ciudad,
            'comentario' => $this->comentario,
            'foto_url' => $this->foto_url,
            'foto_vehiculo_url' => $this->foto_vehiculo_url,
            'vehiculo' => $this->vehiculo,
            'calificacion' => $this->calificacion,
            'video_url' => $this->video_url,
            $this->mergeWhen($request->is('api/admin/*'), fn () => [
                'autorizado' => (bool) $this->autorizado,
                'orden' => $this->orden,
                'activo' => (bool) $this->activo,
            ]),
        ];
    }
}
