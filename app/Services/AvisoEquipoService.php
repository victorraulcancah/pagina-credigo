<?php

namespace App\Services;

use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Avisa por correo al equipo (Panel → Empresa y contacto → Notificaciones).
 * Si el correo falla, no se interrumpe lo que hizo el visitante: se anota en el log.
 */
class AvisoEquipoService
{
    public function __construct(private ConfiguracionService $configuracion) {}

    public function enviar(Mailable $correo): void
    {
        $destinatarios = $this->configuracion->correosInternos();

        if (! $destinatarios) {
            return;
        }

        try {
            Mail::to($destinatarios)->send($correo);
        } catch (Throwable $e) {
            Log::error('No se pudo enviar el aviso al equipo: '.$e->getMessage());
        }
    }
}
