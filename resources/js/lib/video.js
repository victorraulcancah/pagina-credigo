/** Enlace corto de TikTok (botón "Compartir" del celular): el servidor lo completa al guardar. */
export const esEnlaceCortoTiktok = (url) => /^https?:\/\/(?:(?:vm|vt)\.tiktok\.com\/[\w-]+|(?:www\.)?tiktok\.com\/t\/[\w-]+)\/?/i.test(url ?? '');

/**
 * Convierte el enlace de un video (el que se pega en el panel) en lo necesario para insertarlo.
 * Soporta los mismos formatos que valida el servidor (app/Http/Requests/Admin/VideoRegla.php):
 * YouTube (video, shorts, en vivo), TikTok, Facebook (video, watch, reel) y Vimeo.
 * También un video subido al sitio (MP4, MOV, WEBM): { proveedor: 'Video', archivo: true, src }.
 *
 * Devuelve { proveedor, embed, miniatura, vertical } o null si el enlace no se reconoce.
 * `embed` ya lleva autoplay: el iframe solo se crea cuando la persona toca "reproducir".
 */
export function parsearVideo(url) {
    if (!url) return null;
    let enlace;
    try {
        enlace = new URL(url, window.location.origin);
    } catch {
        return null;
    }
    const host = enlace.hostname.replace(/^(www|m|web)\./, '');
    const ruta = enlace.pathname;

    // Video subido (o elegido en el panel y aún sin guardar: blob:)
    if (enlace.protocol === 'blob:' || (/^(https?:|\/)/i.test(url) && /\.(mp4|m4v|mov|webm)$/i.test(ruta))) {
        return { proveedor: 'Video', archivo: true, src: url, embed: null, miniatura: null, vertical: null };
    }

    if (host === 'youtube.com' || host === 'youtu.be') {
        const id =
            host === 'youtu.be'
                ? ruta.slice(1, 12)
                : (enlace.searchParams.get('v') ?? ruta.match(/^\/(?:shorts|live|embed)\/([\w-]{11})/)?.[1]);
        if (!id || !/^[\w-]{11}$/.test(id)) return null;
        return {
            proveedor: 'YouTube',
            // youtube-nocookie: no deja cookies hasta que se reproduce
            embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`,
            miniatura: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
            vertical: ruta.startsWith('/shorts/'),
        };
    }

    if (host === 'tiktok.com') {
        const id = ruta.match(/\/video\/(\d+)/)?.[1];
        if (!id) return null;
        return { proveedor: 'TikTok', embed: `https://www.tiktok.com/player/v1/${id}?autoplay=1&rel=0`, miniatura: null, vertical: true };
    }

    if (host === 'facebook.com') {
        const href = encodeURIComponent(url);
        return {
            proveedor: 'Facebook',
            embed: `https://www.facebook.com/plugins/video.php?href=${href}&show_text=false&autoplay=true`,
            miniatura: null,
            vertical: ruta.startsWith('/reel/'),
        };
    }

    if (host === 'vimeo.com') {
        const id = ruta.match(/^\/(\d+)/)?.[1];
        if (!id) return null;
        return { proveedor: 'Vimeo', embed: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`, miniatura: null, vertical: false };
    }

    return null;
}
