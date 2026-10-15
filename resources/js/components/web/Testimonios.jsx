import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Quote, Star } from 'lucide-react';
import { useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import Revelar from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import { BotonVideo } from '@/components/web/Video';
import { cn } from '@/lib/utils';

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

/** Nombre, ciudad, estrellas, vehículo y el video (si hay) de un conductor. */
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
            {testimonio.video_url && (
                <BotonVideo url={testimonio.video_url} titulo={`La historia de ${testimonio.nombre}`} enlace className="mt-3 text-sm font-semibold">
                    Ver su historia en video
                </BotonVideo>
            )}
        </div>
    );
}

/** Una historia en grande: foto del conductor, su comentario y su vehículo. */
function Historia({ testimonio, posicion, total, activa }) {
    return (
        <article
            role="group"
            aria-roledescription="historia"
            aria-label={`${posicion} de ${total}: ${testimonio.nombre}`}
            aria-hidden={!activa}
            inert={!activa}
            className={cn(
                'col-start-1 row-start-1 grid grid-cols-1 grid-rows-[auto_1fr] overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-primary-100 transition-opacity duration-500 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:grid-rows-1',
                activa ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
        >
            <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[26rem]">
                <FotoConductor testimonio={testimonio} alt={`Foto de ${testimonio.nombre}`} className="absolute inset-0 size-full object-top text-6xl" />
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
    const toque = useRef(null);

    if (!testimonios.length) return null;

    const cantidad = testimonios.length;
    const varias = cantidad > 1;
    const ir = (paso) => setActual((i) => (i + paso + cantidad) % cantidad);
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
                                <Historia key={testimonio.id} testimonio={testimonio} posicion={i + 1} total={cantidad} activa={i === actual} />
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
                                            onClick={() => setActual(i)}
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
