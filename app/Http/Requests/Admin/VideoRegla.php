<?php

namespace App\Http\Requests\Admin;

use App\Services\EnlaceVideoService;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Enlaces de video que la web sabe insertar (resources/js/lib/video.js):
 * YouTube (video, shorts o en vivo), TikTok, Facebook (video, watch o reel) y Vimeo.
 * Los enlaces cortos de TikTok (vm.tiktok.com, botón "Compartir" del celular) se completan
 * solos antes de validar (completar()). Los de Facebook (fb.watch) no traen el video: se pide el completo.
 */
final class VideoRegla
{
    private const YOUTUBE = '(?:www\.|m\.)?youtube\.com/(?:watch\?(?:[^#]*&)?v=|shorts/|live/|embed/)[\w-]{11}|youtu\.be/[\w-]{11}';

    private const TIKTOK = '(?:www\.)?tiktok\.com/@[\w.-]+/video/\d+';

    private const FACEBOOK = '(?:www\.|m\.|web\.)?facebook\.com/(?:[^?#]+/videos/|watch/?\?v=|reel/)\S+';

    private const VIMEO = '(?:www\.)?vimeo\.com/\d+';

    public const PATRON = '~^https://(?:'.self::YOUTUBE.'|'.self::TIKTOK.'|'.self::FACEBOOK.'|'.self::VIMEO.')~i';

    /** Los testimonios llevan un enlace por red: red => [patrón, mensaje si el enlace no es de esa red]. */
    private const REDES = [
        'tiktok' => [self::TIKTOK, 'Pega el enlace de un video de TikTok (https://www.tiktok.com/@usuario/video/… o el de Compartir: https://vm.tiktok.com/…).'],
        'youtube' => [self::YOUTUBE, 'Pega el enlace de un video de YouTube (https://www.youtube.com/watch?v=…, /shorts/… o https://youtu.be/…).'],
        'facebook' => [self::FACEBOOK, 'Pega el enlace de un video de Facebook (https://www.facebook.com/…/videos/… o /reel/…). Los enlaces cortos (fb.watch) no sirven: abre el video y copia el enlace del navegador.'],
    ];

    /** `$red` (tiktok, youtube o facebook): solo acepta videos de esa red. */
    public static function reglas(?string $red = null): array
    {
        $patron = $red ? '~^https://(?:'.self::REDES[$red][0].')~i' : self::PATRON;

        return ['nullable', 'string', 'max:255', 'regex:'.$patron];
    }

    public static function mensajes(string $campo, ?string $red = null): array
    {
        return [
            "{$campo}.regex" => $red
                ? self::REDES[$red][1]
                : 'Pega el enlace de un video de YouTube, TikTok, Facebook o Vimeo (empieza con https://). Los enlaces cortos de Facebook (fb.watch) no sirven: abre el video y copia el enlace del navegador.',
        ];
    }

    /** Antes de validar: un enlace corto de TikTok pasa a ser el enlace completo del video. */
    public static function completar(FormRequest $request, string $campo = 'video_url'): void
    {
        if ($request->filled($campo)) {
            $request->merge([$campo => app(EnlaceVideoService::class)->completar(trim((string) $request->input($campo)))]);
        }
    }
}
