<?php

namespace App\Services\Erp;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Cliente de solo lectura para la API pública del ERP de CrediGo.
 * Nunca lanza excepciones: si el ERP no responde devuelve null y lo registra en el log,
 * para que la web siga funcionando con su última copia.
 */
class ClienteErp
{
    public function configurado(): bool
    {
        return config('services.erp.url') !== '';
    }

    /** `data` de la respuesta estándar del ERP ({ success, data, message }) o null si falla. */
    public function get(string $ruta, array $query = []): ?array
    {
        if (! $this->configurado()) {
            return null;
        }

        try {
            $respuesta = Http::baseUrl(config('services.erp.url'))
                ->acceptJson()
                ->timeout(config('services.erp.timeout'))
                ->get($ruta, $query);

            if ($respuesta->successful() && $respuesta->json('success') === true) {
                return $respuesta->json('data');
            }

            Log::warning('ERP: respuesta no válida', ['ruta' => $ruta, 'estado' => $respuesta->status()]);
        } catch (Throwable $e) {
            Log::warning('ERP: sin conexión', ['ruta' => $ruta, 'error' => $e->getMessage()]);
        }

        return null;
    }

    /** URL pública de un archivo guardado en el ERP (logos, imágenes). */
    public function archivo(?string $ruta): ?string
    {
        if (! $ruta) {
            return null;
        }

        if (preg_match('#^https?://#', $ruta)) {
            return $ruta;
        }

        $base = config('services.erp.storage_url') ?: config('services.erp.url').'/storage';

        return $base.'/'.ltrim($ruta, '/');
    }
}
