<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Completa los enlaces cortos de TikTok (los que da el botón "Compartir" del celular:
 * vm.tiktok.com/…, vt.tiktok.com/…, tiktok.com/t/…). No traen el número del video, así
 * que se siguen las redirecciones de TikTok hasta el enlace completo (tiktok.com/@usuario/video/123).
 * Si TikTok no responde, el enlace queda como estaba y la validación avisa.
 */
class EnlaceVideoService
{
    private const CORTO = '~^https?://(?:(?:vm|vt)\.tiktok\.com/[\w-]+|(?:www\.)?tiktok\.com/t/[\w-]+)/?~i';

    private const COMPLETO = '~^(https://(?:www\.)?tiktok\.com/@[\w.-]+/video/\d+)~i';

    private const MAX_SALTOS = 5;

    public function esCortoDeTiktok(?string $url): bool
    {
        return $url !== null && preg_match(self::CORTO, trim($url)) === 1;
    }

    public function completar(?string $url): ?string
    {
        if (! $this->esCortoDeTiktok($url)) {
            return $url;
        }

        try {
            $actual = trim($url);

            // Se sigue cada redirección a mano hasta llegar al enlace del video
            for ($salto = 0; $salto < self::MAX_SALTOS && ! preg_match(self::COMPLETO, $actual); $salto++) {
                $respuesta = Http::timeout(6)
                    ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; CrediGo)'])
                    ->withOptions(['allow_redirects' => false])
                    ->get($actual);

                $siguiente = $respuesta->redirect() ? $respuesta->header('Location') : '';
                if ($siguiente === '') {
                    break;
                }

                $actual = str_starts_with($siguiente, '/') ? 'https://www.tiktok.com'.$siguiente : $siguiente;
            }

            // Solo la parte que identifica el video (sin los parámetros de rastreo de TikTok)
            return preg_match(self::COMPLETO, $actual, $coincidencia) ? $coincidencia[1] : $url;
        } catch (Throwable) {
            return $url;
        }
    }
}
