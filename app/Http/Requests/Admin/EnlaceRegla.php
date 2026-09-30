<?php

namespace App\Http\Requests\Admin;

/** Enlaces de botones: ruta interna (/soporte), ancla (#faq), http(s), mailto: o tel:. */
final class EnlaceRegla
{
    public const PATRON = '/^(\/|#|https?:\/\/|mailto:|tel:)/';

    public static function mensajes(string $campo): array
    {
        return [
            "{$campo}.regex" => 'El enlace debe empezar con / (página del sitio), # , https://, mailto: o tel:',
        ];
    }
}
