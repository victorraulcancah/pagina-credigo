import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Quote, Star } from 'lucide-react';
import { useRef, useState } from 'react';
import { FaFacebookF, FaTiktok, FaYoutube } from 'react-icons/fa6';
import Button from '@/components/ui/Button';
import Revelar from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import { BotonReproducir, pausarVideos, VentanaVideo, VideoEnLinea } from '@/components/web/Video';
import { cn } from '@/lib/utils';
import { parsearVideo } from '@/lib/video';

/**
 * Redes donde el conductor puede tener el video de su historia (un enlace por red en el panel).
 * El ícono va con el color de la red (`color`) y al pasar el mouse el círculo se rellena con él (`relleno`).
 */
export const REDES_VIDEO = [
    { campo: 'tiktok_url', nombre: 'TikTok', icono: FaTiktok, color: 'text-[#010101]', relleno: 'hover:bg-[#010101]', placeholder: 'https://www.tiktok.com/@usuario/video/…' },
    { campo: 'youtube_url', nombre: 'YouTube', icono: FaYoutube, color: 'text-[#ff0033]', relleno: 'hover:bg-[#ff0033]', placeholder: 'https://www.youtube.com/watch?v=…' },
    { campo: 'facebook_url', nombre: 'Facebook', icono: FaFacebookF, color: 'text-[#0866ff]', relleno: 'hover:bg-[#0866ff]', placeholder: 'https://www.facebook.com/…/videos/…' },
];

const iniciales = (nombre = '') =>
    nombre
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join('')
        .toUpperCase();

/** Título de sección: si empieza con una cifra ("+150 conductores…") la cifra va resaltada. */
export function TituloConCifra({ titulo, as: Tag = 'h2', className }) {
    const [, cifra, resto] = titulo.match(/^(\+?\d[\d.,]*\+?)\s+(.+)$/s) ?? [];

    return (
        <Tag className={cn('max-w-3xl text-3xl leading-[1.12] font-bold tracking-[-0.03em] text-balance text-primary sm:text-4xl lg:text-5xl', className)}>
            {cifra ? (
                <>
                    <span className="rounded-xl bg-accent px-2 tabular-nums [box-decoration-break:clone]">{cifra}</span> {resto}
                </>
            ) : (
                titulo
            )}
        </Tag>
    );
}

/** Foto del conductor; sin foto, sus iniciales sobre el azul de marca. */
export function FotoConductor({ testimonio, alt = '', className }) {
    return testimonio.foto_url ? (
        <img src={testimonio.foto_url} alt={alt} loading="lazy" className={cn('object-cover', className)} />
    ) : (
        <span aria-hidden="true" className={cn('flex items-center justify-center bg-primary font-bold text-accent', className)}>
            {iniciales(testimonio.nombre)}
        </span>
    );
}

/**
 * Portada de una historia: la foto del conductor; sin foto pero con video subido, el primer
 * cuadro del video (solo se descargan sus datos iniciales); sin ninguno, sus iniciales.
 */
export function PortadaHistoria({ testimonio, alt, className }) {
    if (!testimonio.foto_url && testimonio.video_archivo_url) {
        return (
            <video
                src={`${testimonio.video_archivo_url}#t=0.1`}
                preload="metadata"
                muted
                playsInline
                aria-hidden="true"
                tabIndex={-1}
                className={cn('object-cover', className)}
            />
        );
    }

    return <FotoConductor testimonio={testimonio} alt={alt} className={className} />;
}

/** Íconos de TikTok, YouTube y Facebook (solo los que tienen enlace): cada uno abre su video en una ventana. */
export function VideosEnRedes({ testimonio, className }) {
    const [elegida, setElegida] = useState(null);
    const [abierta, setAbierta] = useState(false);
    const redes = REDES_VIDEO.filter((red) => parsearVideo(testimonio[red.campo]));
    if (!redes.length) return null;

    return (
        <div className={cn('flex items-center gap-3', className)}>
            <span className="text-xs font-semibold text-primary-700/70">Mira su video en</span>
            <ul className="flex gap-2">
                {redes.map((red) => (
                    <li key={red.campo}>
                        <button
                            type="button"
                            onClick={() => {
                                pausarVideos();
                                setElegida(red);
                                setAbierta(true);
                            }}
                            aria-label={`Ver la historia de ${testimonio.nombre} en ${red.nombre}`}
                            title={red.nombre}
                            className={cn(
                                'flex size-10 items-center justify-center rounded-full bg-white ring-1 ring-primary-100 transition duration-300 ease-out',
                                'hover:-translate-y-0.5 hover:text-white hover:shadow-lg hover:shadow-primary/20 hover:ring-transparent',
                                red.color,
                                red.relleno,
                            )}
                        >
                            <red.icono className="size-4" aria-hidden="true" />
                        </button>
                    </li>
                ))}
            </ul>
            {elegida && (
                <VentanaVideo
                    url={testimonio[elegida.campo]}
                    titulo={`La historia de ${testimonio.nombre} en ${elegida.nombre}`}
                    abierto={abierta}
                    onClose={() => setAbierta(false)}
                />
            )}
        </div>
    );
}

/** Calificación que dio el propio conductor (1 a 5). Sin calificación no se muestra nada. */
export function Estrellas({ valor, className }) {
    if (!valor) return null;

    return (
        <span role="img" aria-label={`${valor} de 5 estrellas`} className={cn('flex gap-0.5', className)}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className={cn('size-4', i <= valor ? 'fill-accent text-primary' : 'fill-transparent text-primary-200')}
                />
            ))}
        </span>
    );
}

/** El comentario entre comillas, en un recuadro con borde amarillo. */
export function Comentario({ texto, className }) {
    return (
        <blockquote className={cn('relative rounded-2xl bg-white p-5 pt-7 ring-2 ring-accent sm:p-6 sm:pt-8', className)}>
            <span aria-hidden="true" className="absolute -top-4 left-5 flex size-9 items-center justify-center rounded-full bg-accent text-primary">
                <Quote className="size-4 fill-current" />
            </span>
            <p className="text-lg leading-snug font-semibold text-pretty text-primary sm:text-xl">{texto}</p>
        </blockquote>
    );
}

/** Nombre, ciudad, estrellas, vehículo y sus videos en redes (si hay) de un conductor. */
export function DatosConductor({ testimonio, className }) {
    return (
        <div className={className}>
            <p className="text-2xl font-bold tracking-[-0.02em]">{testimonio.nombre}</p>
            {testimonio.ciudad && (
                <p className="mt-1 flex items-center gap-1 text-sm text-primary-700/80">
                    <MapPin className="size-4 shrink-0" aria-hidden="true" /> {testimonio.ciudad}
                </p>
            )}
            <Estrellas valor={testimonio.calificacion} className="mt-2" />
            {testimonio.vehiculo && <p className="mt-2 text-sm font-semibold">{testimonio.vehiculo}</p>}
            <VideosEnRedes testimonio={testimonio} className="mt-4" />
        </div>
    );
}

/**
 * Una historia en grande: foto del conductor, su comentario y su vehículo.
 * Con video subido, la foto lleva el botón de reproducir y el video se ve ahí mismo.
 */
function Historia({ testimonio, posicion, total, activa, reproduciendo, onReproducir }) {
    const titulo = `La historia de ${testimonio.nombre}`;

    return (
        <article
            role="group"
            aria-roledescription="historia"
            aria-label={`${posicion} de ${total}: ${testimonio.nombre}`}
            aria-hidden={!activa}
            inert={!activa}
            className={cn(
                'col-start-1 row-start-1 grid grid-cols-1 grid-rows-[auto_1fr] overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-primary-100 transition-opacity duration-500 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:grid-rows-1',
                activa ? 'opacity-100 motion-safe:animate-deslizar' : 'pointer-events-none opacity-0',
            )}
        >
            <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[26rem]">
                {reproduciendo ? (
                    <VideoEnLinea src={testimonio.video_archivo_url} titulo={titulo} />
                ) : (
                    <>
                        <PortadaHistoria testimonio={testimonio} alt={`Foto de ${testimonio.nombre}`} className="absolute inset-0 size-full object-top text-6xl" />
                        {testimonio.video_archivo_url && <BotonReproducir onClick={onReproducir} etiqueta={`Reproducir el video: ${titulo}`} />}
                    </>
                )}
            </div>
            <figure className="flex flex-col p-6 sm:p-8">
                <Comentario texto={testimonio.comentario} className="mt-3" />
                <figcaption className="mt-6 flex flex-1 flex-wrap items-end justify-between gap-x-4 gap-y-5">
                    <DatosConductor testimonio={testimonio} />
                    {testimonio.foto_vehiculo_url && (
                        <img
                            src={testimonio.foto_vehiculo_url}
                            alt={testimonio.vehiculo ? `Vehículo: ${testimonio.vehiculo}` : `Vehículo de ${testimonio.nombre}`}
                            loading="lazy"
                            className="ml-auto max-h-40 w-full max-w-[17rem] rounded-xl object-contain"
                        />
                    )}
                </figcaption>
            </figure>
        </article>
    );
}

function Flecha({ direccion, onClick, className }) {
    const Icono = direccion === 'anterior' ? ChevronLeft : ChevronRight;

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={direccion === 'anterior' ? 'Historia anterior' : 'Historia siguiente'}
            className={cn('flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-700', className)}
        >
            <Icono className="size-5" aria-hidden="true" />
        </button>
    );
}

/**
 * Historias de conductores en el inicio: titular con la cifra resaltada y un carrusel
 * (flechas, fotos para saltar a cada historia y deslizar con el dedo en celular).
 * Sin historias publicadas la sección no se muestra. `total`: todas las publicadas;
 * si hay más que las del carrusel aparece "Ver más historias".
 */
export default function TestimoniosSection({ seccion, testimonios = [], total = 0 }) {
    const [actual, setActual] = useState(0);
    // Historia cuyo video se está viendo: al pasar a otra se detiene
    const [reproduciendo, setReproduciendo] = useState(null);
    const toque = useRef(null);

    if (!testimonios.length) return null;

    const cantidad = testimonios.length;
    const varias = cantidad > 1;
    const mostrar = (i) => {
        setActual(i);
        setReproduciendo(null);
    };
    const ir = (paso) => mostrar((actual + paso + cantidad) % cantidad);
    const verMas = seccion?.boton_url && total > cantidad;

    const alSoltar = (e) => {
        if (toque.current === null || !varias) return;
        const distancia = e.changedTouches[0].clientX - toque.current;
        toque.current = null;
        if (Math.abs(distancia) > 50) ir(distancia < 0 ? 1 : -1);
    };

    return (
        <Section id="historias" background="muted">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:items-center lg:gap-14">
                <Revelar>
                    <TituloConCifra titulo={seccion?.titulo || 'Conductores que ya tienen su propio vehículo'} />
                    {seccion?.contenido && <p className="mt-4 max-w-md text-lg text-primary-700/80">{seccion.contenido}</p>}
                    {verMas && (
                        <Button href={seccion.boton_url} variant="outline" icon={ArrowRight} iconPosition="right" className="mt-8 hidden lg:inline-flex">
                            {seccion.boton_texto || 'Ver más historias'}
                        </Button>
                    )}
                </Revelar>

                <Revelar desde="derecha" retraso={120}>
                    <section aria-roledescription="carrusel" aria-label="Historias de conductores" className="relative">
                        {/* Todas las historias en la misma celda: el alto lo define la más larga */}
                        <div className="grid grid-cols-1" onTouchStart={(e) => (toque.current = e.touches[0].clientX)} onTouchEnd={alSoltar}>
                            {testimonios.map((testimonio, i) => (
                                <Historia
                                    key={testimonio.id}
                                    testimonio={testimonio}
                                    posicion={i + 1}
                                    total={cantidad}
                                    activa={i === actual}
                                    reproduciendo={reproduciendo === testimonio.id}
                                    onReproducir={() => setReproduciendo(testimonio.id)}
                                />
                            ))}
                        </div>

                        {varias && (
                            <>
                                <Flecha direccion="anterior" onClick={() => ir(-1)} className="absolute top-1/2 -left-5 hidden -translate-y-1/2 shadow-lg shadow-primary/20 lg:flex" />
                                <Flecha direccion="siguiente" onClick={() => ir(1)} className="absolute top-1/2 -right-5 hidden -translate-y-1/2 shadow-lg shadow-primary/20 lg:flex" />
                            </>
                        )}
                    </section>

                    {varias && (
                        <div className="mt-6 flex items-center gap-3 lg:mt-8">
                            <Flecha direccion="anterior" onClick={() => ir(-1)} className="lg:hidden" />
                            {/* Una foto por historia: tocarla la abre */}
                            <ul className="flex min-w-0 flex-1 gap-3 overflow-x-auto px-1 py-2 sm:gap-4 lg:justify-center">
                                {testimonios.map((testimonio, i) => (
                                    <li key={testimonio.id} className="shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => mostrar(i)}
                                            aria-label={`Ver la historia de ${testimonio.nombre}`}
                                            aria-current={i === actual ? 'true' : undefined}
                                            className={cn(
                                                'block size-14 overflow-hidden rounded-full ring-offset-2 ring-offset-primary-50 transition sm:size-16',
                                                i === actual ? 'ring-4 ring-accent' : 'opacity-70 ring-1 ring-primary-200 hover:opacity-100',
                                            )}
                                        >
                                            <FotoConductor testimonio={testimonio} className="size-full text-base" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <Flecha direccion="siguiente" onClick={() => ir(1)} className="lg:hidden" />
                        </div>
                    )}

                    {verMas && (
                        <Button href={seccion.boton_url} variant="outline" icon={ArrowRight} iconPosition="right" className="mt-8 lg:hidden">
                            {seccion.boton_texto || 'Ver más historias'}
                        </Button>
                    )}
                </Revelar>
            </div>
        </Section>
    );
}
