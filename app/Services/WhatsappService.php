<?php

namespace App\Services;

/** Enlaces de WhatsApp al número de la empresa (Panel → Empresa y contacto). */
class WhatsappService
{
    public function __construct(private ConfiguracionService $configuracion) {}

    /** wa.me de la empresa con el mensaje ya escrito (sin mensaje: el del panel), o null si no hay WhatsApp. */
    public function enlace(?string $texto = null): ?string
    {
        $numero = $this->configuracion->get('contacto_whatsapp');

        if (! $numero) {
            return null;
        }

        $texto = filled($texto) ? $texto : $this->configuracion->get('contacto_whatsapp_mensaje');

        return "https://wa.me/{$numero}".(filled($texto) ? '?text='.rawurlencode($texto) : '');
    }
}
