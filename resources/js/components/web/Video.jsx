import { Play, PlayCircle } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { parsearVideo } from '@/lib/video';

/**
 * Video por enlace (YouTube, TikTok, Facebook o Vimeo). No carga el reproductor del
 * proveedor hasta que la persona toca reproducir: antes solo se ve la miniatura (o el
 * azul de marca) con el botón. Ahorra datos en el celular y no deja cookies de terceros
 * al abrir la página. Los videos verticales (shorts, TikTok, reels) se muestran angostos.
 * `reproduciendo`: arranca directo con el reproductor (lo usa el modal).
 */
export default function Video({ url, titulo, className, reproduciendo = false }) {
    const video = parsearVideo(url);
    const [activo, setActivo] = useState(reproduciendo);
    const [sinMiniatura, setSinMiniatura] = useState(false);
    if (!video) return null;

    const nombre = titulo || 'Video';
    const marco = cn(
        'relative overflow-hidden rounded-2xl bg-primary',
        video.vertical ? 'mx-auto aspect-[9/16] w-full max-w-xs' : 'aspect-video w-full',
        className,
    );

    if (activo) {
        return (
            <div className={marco}>
                <iframe
                    src={video.embed}
                    title={nombre}
                    className="absolute inset-0 size-full"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                />
            </div>
        );
    }

    return (
        <button type="button" onClick={() => setActivo(true)} aria-label={`Reproducir video: ${nombre}`} className={cn(marco, 'group block text-white')}>
            {video.miniatura && !sinMiniatura && (
                <img
                    src={video.miniatura}
                    alt=""
                    loading="lazy"
                    onError={() => setSinMiniatura(true)}
                    className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
            )}
            <span aria-hidden="true" className="absolute inset-0 bg-primary/30 transition duration-300 group-hover:bg-primary/15" />
            <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-accent text-primary shadow-lg shadow-black/25 transition duration-300 group-hover:scale-110 sm:size-20">
                    <Play className="ml-1 size-7 fill-current sm:size-8" aria-hidden="true" />
                </span>
            </span>
            <span className="absolute bottom-4 left-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold sm:bottom-5 sm:left-5">{video.proveedor}</span>
        </button>
    );
}

/**
 * Botón "Ver video" que abre el video en una ventana (para tarjetas y banners, donde no entra el reproductor).
 * `enlace`: se ve como texto con ícono (para filas de enlaces), no como botón.
 */
export function BotonVideo({ url, titulo, variant = 'outline', enlace = false, className, children = 'Ver video', ...props }) {
    const [abierto, setAbierto] = useState(false);
    const video = parsearVideo(url);
    if (!video) return null;

    return (
        <>
            {enlace ? (
                <button type="button" onClick={() => setAbierto(true)} className={cn('inline-flex items-center gap-1.5 hover:underline', className)} {...props}>
                    <PlayCircle className="size-4 shrink-0" aria-hidden="true" /> {children}
                </button>
            ) : (
                <Button variant={variant} icon={PlayCircle} onClick={() => setAbierto(true)} className={className} {...props}>
                    {children}
                </Button>
            )}
            {/* El reproductor existe solo mientras la ventana está abierta: al cerrarla el video se detiene */}
            <Modal
                open={abierto}
                onClose={() => setAbierto(false)}
                title={titulo || 'Video'}
                maxWidth={video.vertical ? 'max-w-sm' : 'max-w-4xl'}
                bodyClassName="bg-black p-0 sm:p-0"
            >
                <Video url={url} titulo={titulo} reproduciendo className="max-w-none rounded-none" />
            </Modal>
        </>
    );
}
