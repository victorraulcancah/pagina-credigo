<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;

/**
 * Foto, comprobante o video de una hoja de reclamación. Solo el panel (con sesión) recibe
 * la dirección para verlo: firmada y temporal, para que funcione también en otra pestaña.
 */
class ReclamacionAdjuntoResource extends JsonResource
{
    // Una jornada de trabajo: la bandeja puede quedar abierta varias horas
    private const HORAS_VALIDEZ = 8;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tipo' => $this->tipo,
            'nombre_original' => $this->nombre_original,
            'mime' => $this->mime,
            'tamano' => $this->tamano,
            'url' => $this->when($request->user() !== null, fn () => URL::temporarySignedRoute(
                'api.admin.reclamaciones.adjunto',
                now()->addHours(self::HORAS_VALIDEZ),
                ['adjunto' => $this->id],
                absolute: false,
            )),
        ];
    }
}
