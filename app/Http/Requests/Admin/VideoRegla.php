<?php

namespace App\Http\Requests\Admin;

/**
 * Enlaces de video que la web sabe insertar (resources/js/lib/video.js):
 * YouTube (video, shorts o en vivo), TikTok, Facebook (video, watch o reel) y Vimeo.
 * Los enlaces cortos de TikTok (vm.tiktok.com) y Facebook (fb.watch) no traen el
 * identificador del video: se pide el enlace completo.
 */
final class VideoRegla
{
    public const PATRON = '~^https://(?:'
        .'(?:www\.|m\.)?youtube\.com/(?:watch\?(?:[^#]*&)?v=|shorts/|live/|embed/)[\w-]{11}'
        .'|youtu\.be/[\w-]{11}'
        .'|(?:www\.)?tiktok\.com/@[\w.-]+/video/\d+'
        .'|(?:www\.|m\.|web\.)?facebook\.com/(?:[^?#]+/videos/|watch/?\?v=|reel/)\S+'
        .'|(?:www\.)?vimeo\.com/\d+'
        .')~i';

    public static function reglas(): array
    {
        return ['nullable', 'string', 'max:255', 'regex:'.self::PATRON];
    }

    public static function mensajes(string $campo): array
    {
        return [
            "{$campo}.regex" => 'Pega el enlace completo de un video de YouTube, TikTok, Facebook o Vimeo (empieza con https://). Los enlaces cortos de TikTok (vm.tiktok.com) o Facebook (fb.watch) no sirven: abre el video y copia el enlace del navegador.',
        ];
    }
}
