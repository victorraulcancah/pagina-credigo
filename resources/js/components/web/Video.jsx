import { Play, PlayCircle } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { parsearVideo } from '@/lib/video';

/**
 * Video por enlace (YouTube, TikTok, Facebook o Vimeo) o subido al sitio (MP4, MOV, WEBM).
 * No carga el reproductor del proveedor hasta que la persona toca reproducir: antes solo se
 * ve la miniatura (o el azul de marca) con el botón. Ahorra datos en el celular y no deja
 * cookies de terceros al abrir la página. Los videos verticales (shorts, TikTok, reels y los
 * grabados con el celular) se muestran angostos.
 * `reproduciendo`: arranca directo con el reproductor (lo usa el modal).
 */
export default function Video({ url, titulo, className, reproduciendo = false }) {
    const video = parsearVideo(url);
    const [activo, setActivo] = useState(reproduciendo);
    const [sinMiniatura, setSinMiniatura] = useState(false);
    // De un video subido no se sabe si es vertical hasta leer sus medidas (se supone de celular)
    const [verticalArchivo, setVerticalArchivo] = useState(true);
    if (!video) return null;

    const nombre = titulo || 'Video';
    const vertical = video.archivo ? verticalArchivo : video.vertical;
    const marco = cn(
        // @container: el botón de reproducir crece con el marco (chico en las vistas previas del panel)
        '@container relative overflow-hidden rounded-2xl bg-primary',
        vertical ? 'mx-auto aspect-[9/16] w-full max-w-xs' : 'aspect-video w-full',
        className,
    );
    const alLeerMedidas = (e) => setVerticalArchivo(e.currentTarget.videoHeight > e.currentTarget.videoWidth);

    if (video.archivo) {
        return activo ? (
            <div className={cn(marco, 'bg-black')}>
                <video src={video.src} title={nombre} controls autoPlay playsInline onLoadedMetadata={alLeerMedidas} className="absolute inset-0 size-full object-contain" />
            </div>
        ) : (
            <button type="button" onClick={() => setActivo(true)} aria-label={`Reproducir video: ${nombre}`} className={cn(marco, 'group block text-white')}>
                {/* El primer cuadro del video hace de miniatura (solo se descargan sus datos iniciales) */}
                <video src={`${video.src}#t=0.1`} preload="metadata" muted playsInline onLoadedMetadata={alLeerMedidas} aria-hidden="true" className="absolute inset-0 size-full object-cover" />
                <span aria-hidden="true" className="absolute inset-0 bg-primary/30 transition duration-300 group-hover:bg-primary/15" />
                <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-11 items-center justify-center rounded-full bg-accent text-primary shadow-lg shadow-black/25 transition duration-300 group-hover:scale-110 @[15rem]:size-16 @lg:size-20">
                        <Play className="ml-0.5 size-5 fill-current @[15rem]:ml-1 @[15rem]:size-7 @lg:size-8" aria-hidden="true" />
                    </span>
                </span>
            </button>
        );
    }

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
                <span className="flex size-11 items-center justify-center rounded-full bg-accent text-primary shadow-lg shadow-black/25 transition duration-300 group-hover:scale-110 @[15rem]:size-16 @lg:size-20">
                    <Play className="ml-0.5 size-5 fill-current @[15rem]:ml-1 @[15rem]:size-7 @lg:size-8" aria-hidden="true" />
                </span>
            </span>
            <span className="absolute bottom-4 left-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold sm:bottom-5 sm:left-5">{video.proveedor}</span>
        </button>
    );
}

/**
 * El video en una ventana. El reproductor existe solo mientras está abierta: al cerrarla el video se detiene.
 * Los verticales (TikTok, shorts, reels) en una ventana angosta.
 */
export function VentanaVideo({ url, titulo, abierto, onClose }) {
    const video = parsearVideo(url);
    if (!video) return null;

    return (
        <Modal open={abierto} onClose={onClose} title={titulo || 'Video'} maxWidth={video.vertical ? 'max-w-sm' : 'max-w-4xl'} bodyClassName="bg-black p-0 sm:p-0">
            <Video key={url} url={url} titulo={titulo} reproduciendo className="max-w-none rounded-none" />
        </Modal>
    );
}

/**
 * Botón "Ver video" que abre el video en una ventana (para tarjetas y banners, donde no entra el reproductor).
 * `enlace`: se ve como texto con ícono (para filas de enlaces), no como botón.
 */
export function BotonVideo({ url, titulo, variant = 'outline', enlace = false, className, children = 'Ver video', ...props }) {
    const [abierto, setAbierto] = useState(false);
    if (!parsearVideo(url)) return null;

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
            <VentanaVideo url={url} titulo={titulo} abierto={abierto} onClose={() => setAbierto(false)} />
        </>
    );
}

/**
 * Botón de reproducir que cubre la portada de una historia (la foto del conductor o el primer
 * cuadro de su video): se toca en cualquier parte.
 * - centro (por defecto): botón grande al medio y `texto` debajo; al pasar el mouse el aro crece.
 * - esquina: píldora amarilla abajo a la izquierda (deja libre la esquina derecha para la foto del vehículo).
 */
export function BotonReproducir({ onClick, etiqueta, texto = 'Ver su historia', esquina = false, className }) {
    if (esquina) {
        return (
            <button
                type="button"
                onClick={onClick}
                aria-label={etiqueta}
                className={cn('group/play absolute inset-0 flex items-end bg-gradient-to-t from-primary/70 via-primary/10 to-transparent p-5', className)}
            >
                <span className="inline-flex items-center gap-2.5 rounded-full bg-accent py-1.5 pr-4 pl-1.5 text-[0.8125rem] font-bold whitespace-nowrap text-primary shadow-xl shadow-black/30 transition duration-300 ease-out group-hover/play:-translate-y-1 group-focus-visible/play:-translate-y-1 sm:text-sm">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary text-accent ring-4 ring-primary/15 transition-all duration-300 group-hover/play:ring-8">
                        <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" />
                    </span>
                    {texto}
                </span>
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={etiqueta}
            className={cn(
                'group/play absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-t from-primary/75 via-primary/15 to-primary/5 text-white',
                className,
            )}
        >
            <span className="flex size-16 items-center justify-center rounded-full bg-accent text-primary shadow-xl shadow-black/30 ring-8 ring-accent/35 transition-all duration-300 ease-out group-hover/play:scale-110 group-hover/play:ring-[14px] group-focus-visible/play:ring-[14px] sm:size-20">
                <Play className="ml-1 size-7 fill-current sm:size-8" aria-hidden="true" />
            </span>
            <span className="rounded-full bg-primary/85 px-3.5 py-1 text-xs font-semibold tracking-wide">{texto}</span>
        </button>
    );
}

// Al empezar, el foco pasa al video (teclado y lectores de pantalla siguen ahí: espacio pausa)
const enfocar = (el) => el?.focus({ preventScroll: true });

/** Pausa los videos subidos que estén sonando en la página (menos `excepto`): suena uno a la vez. */
export const pausarVideos = (excepto) =>
    document.querySelectorAll('video').forEach((video) => video !== excepto && !video.paused && video.pause());

/**
 * Video subido que se reproduce ahí mismo, sin ventana: llena el marco del padre (que debe ser
 * `relative`) y se detiene al desmontarse. Los toques no llegan al carrusel, para poder adelantar
 * el video sin pasar a otra historia.
 */
export function VideoEnLinea({ src, titulo, className }) {
    const detener = (e) => e.stopPropagation();

    return (
        <div className={cn('absolute inset-0 bg-primary-950', className)} onTouchStart={detener} onTouchEnd={detener}>
            <video
                ref={enfocar}
                src={src}
                title={titulo}
                aria-label={titulo}
                controls
                autoPlay
                playsInline
                onPlay={(e) => pausarVideos(e.currentTarget)}
                className="size-full object-contain outline-none"
            />
        </div>
    );
}
