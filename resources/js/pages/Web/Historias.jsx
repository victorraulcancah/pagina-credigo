import { ArrowRight, Car, MapPin, MessageSquareQuote, Quote } from 'lucide-react';
import { useState } from 'react';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import CtaSection from '@/components/web/CtaSection';
import PaginaApi from '@/components/web/PaginaApi';
import { Estrellas, PortadaHistoria, VideosEnRedes } from '@/components/web/Testimonios';
import { BotonReproducir, VideoEnLinea } from '@/components/web/Video';
import { cn } from '@/lib/utils';

// Proporción de la foto según lo elegido en el panel (Testimonios → Tamaño de la foto). `original`
// no lleva marco fijo: la foto se ve completa, con su propia proporción.
const ASPECTO_FOTO = { horizontal: 'aspect-video', cuadrada: 'aspect-square', vertical: 'aspect-[3/4]', original: '' };

// Ancho de la tarjeta (Testimonios → Tamaño de la tarjeta), en una cuadrícula de 6 columnas desde
// tablet: pequeña = 3 por fila en pantalla grande, mediana = 2 por fila, grande = fila completa con
// la foto al lado del texto. En el celular siempre es una por fila.
const TARJETA = {
    pequena: { columnas: 'md:col-span-3 lg:col-span-2', compacta: true },
    mediana: { columnas: 'md:col-span-3' },
    grande: { columnas: 'md:col-span-6', lateral: true },
};

/**
 * Una historia como tarjeta: la foto del conductor arriba (con la de su vehículo encima, en
 * una esquina), su comentario y al pie su nombre, vehículo y los íconos de sus videos en
 * TikTok, YouTube y Facebook. Si tiene video subido, la foto lleva el botón de reproducir y
 * el video se ve ahí mismo, dentro de la tarjeta.
 * Entran una tras otra desde los costados; al pasar el mouse la foto se acerca, el vehículo
 * se levanta, las comillas giran y se dibuja la línea amarilla del pie.
 */
function TarjetaHistoria({ testimonio, indice }) {
    const [reproduciendo, setReproduciendo] = useState(false);
    const titulo = `La historia de ${testimonio.nombre}`;
    const conVideo = Boolean(testimonio.video_archivo_url);
    const { columnas, compacta, lateral } = TARJETA[testimonio.tamano_tarjeta] ?? TARJETA.mediana;
    // "Original" solo aplica a una foto: con video o iniciales hace falta un marco, el horizontal de siempre
    const original = testimonio.tamano_foto === 'original' && Boolean(testimonio.foto_url) && !reproduciendo;
    const aspecto = original ? ASPECTO_FOTO.original : (ASPECTO_FOTO[testimonio.tamano_foto] || ASPECTO_FOTO.horizontal);

    return (
        <Revelar as="li" desde={indice % 2 ? 'derecha' : 'izquierda'} retraso={escalonar(indice, 110)} className={cn('h-full', columnas)}>
            <figure
                className={cn(
                    'group relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-white ring-1 ring-primary-100 transition duration-300 hover:ring-2 hover:ring-primary',
                    lateral && 'lg:flex-row',
                )}
            >
                <div className={cn('relative overflow-hidden bg-primary', aspecto, lateral && 'lg:w-1/2 lg:shrink-0')}>
                    {reproduciendo ? (
                        <VideoEnLinea src={testimonio.video_archivo_url} titulo={titulo} />
                    ) : (
                        <>
                            <PortadaHistoria
                                testimonio={testimonio}
                                alt={`Foto de ${testimonio.nombre}`}
                                // Sin marco fijo la foto mide 0 hasta cargar y el navegador no la pediría: se carga de inmediato
                                loading={original ? 'eager' : undefined}
                                className={cn(
                                    'text-7xl transition-transform duration-700 ease-out group-hover:scale-105',
                                    original ? 'block h-auto w-full' : 'size-full object-[50%_30%]',
                                )}
                            />
                            {/* Sin foto ni video: las iniciales llevan el resplandor amarillo de la marca */}
                            {!testimonio.foto_url && !conVideo && (
                                <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-96 resplandor-acento transition-transform duration-700 group-hover:scale-110" />
                            )}
                            {conVideo && (
                                <BotonReproducir onClick={() => setReproduciendo(true)} etiqueta={`Reproducir el video: ${titulo}`} esquina />
                            )}
                            {testimonio.ciudad && (
                                <span className="pointer-events-none absolute top-5 left-5 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary">
                                    <MapPin className="size-3.5" aria-hidden="true" /> {testimonio.ciudad}
                                </span>
                            )}
                            {testimonio.foto_vehiculo_url && (
                                <img
                                    src={testimonio.foto_vehiculo_url}
                                    alt={testimonio.vehiculo ? `Vehículo: ${testimonio.vehiculo}` : `Vehículo de ${testimonio.nombre}`}
                                    loading="lazy"
                                    className="pointer-events-none absolute right-5 bottom-5 aspect-[4/3] w-[30%] max-w-48 rounded-2xl bg-white object-cover shadow-xl shadow-primary/30 ring-4 ring-white transition duration-500 ease-out group-hover:-translate-y-2 group-hover:-rotate-2"
                                />
                            )}
                        </>
                    )}
                </div>

                <div className={cn('relative flex flex-1 flex-col', compacta ? 'p-5' : 'p-6 sm:p-7', lateral && 'lg:justify-center lg:p-10')}>
                    <div className="flex items-center justify-between gap-4">
                        <span
                            aria-hidden="true"
                            className="flex size-11 items-center justify-center rounded-full bg-accent text-primary transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-12"
                        >
                            <Quote className="size-5 fill-current" />
                        </span>
                        <Estrellas valor={testimonio.calificacion} />
                    </div>

                    <blockquote className={cn('mt-4 leading-snug font-semibold text-pretty text-primary', compacta ? 'text-base' : 'text-lg sm:text-xl', lateral && 'lg:text-2xl')}>
                        “{testimonio.comentario}”
                    </blockquote>

                    <figcaption className="mt-6 flex flex-1 flex-wrap items-end justify-between gap-x-4 gap-y-3">
                        <div className="w-full border-t border-primary-100 pt-5 sm:flex sm:items-end sm:justify-between sm:gap-4">
                            <div className="min-w-0">
                                <p className="text-lg font-bold">{testimonio.nombre}</p>
                                {testimonio.vehiculo && (
                                    <p className="mt-1 flex items-center gap-1.5 text-sm text-primary-700/80">
                                        <Car className="size-4 shrink-0" aria-hidden="true" /> {testimonio.vehiculo}
                                    </p>
                                )}
                            </div>
                            <VideosEnRedes testimonio={testimonio} className="mt-4 shrink-0 sm:mt-0" />
                        </div>
                    </figcaption>

                    {/* Línea amarilla que se dibuja al pasar el mouse */}
                    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out group-hover:scale-x-100" />
                </div>
            </figure>
        </Revelar>
    );
}

/** Mientras no haya historias publicadas: aviso y el siguiente paso (ver planes o cotizar). */
function SinHistorias() {
    return (
        <Revelar className="mx-auto flex max-w-2xl flex-col items-center border-y border-primary-100 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-accent">
                <MessageSquareQuote className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-6 text-2xl leading-tight font-bold tracking-[-0.02em] text-balance sm:text-3xl">
                Pronto compartiremos sus historias
            </h2>
            <p className="mt-3 max-w-lg text-lg text-pretty text-primary-700/80">
                Estamos reuniendo las experiencias de los conductores que ya recibieron su vehículo. Mientras tanto, conoce nuestros planes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href="/servicios" icon={ArrowRight} iconPosition="right">
                    Ver planes
                </Button>
                <Button href="/cotizador" variant="outline">
                    Cotiza tu plan
                </Button>
            </div>
        </Revelar>
    );
}

function HistoriasContenido({ secciones, testimonios }) {
    const hero = secciones['historias.hero'];

    return (
        <PublicLayout title={hero?.titulo || 'Historias de conductores'}>
            <PageHero imagen={hero?.imagen_url} colorTitulo={hero?.color_titulo} colorTexto={hero?.color_texto} title={hero?.titulo || 'Historias de conductores'} description={hero?.contenido} />

            <Section>
                {testimonios.length > 0 ? (
                    // Cuadrícula de 6 columnas: cada tarjeta ocupa 2, 3 o 6 según su tamaño y `dense` rellena los huecos.
                    // Con una sola historia, la tarjeta va centrada (más ancha si es grande)
                    <ul
                        className={cn(
                            'grid gap-8',
                            testimonios.length > 1
                                ? 'md:grid-flow-dense md:grid-cols-6'
                                : cn('mx-auto', testimonios[0].tamano_tarjeta === 'grande' ? 'max-w-5xl' : 'max-w-2xl'),
                        )}
                    >
                        {testimonios.map((testimonio, i) => (
                            <TarjetaHistoria key={testimonio.id} testimonio={testimonio} indice={i} />
                        ))}
                    </ul>
                ) : (
                    <SinHistorias />
                )}
            </Section>

            <CtaSection seccion={secciones['general.cta']} whatsappPrimero />
        </PublicLayout>
    );
}

/** Historias de conductores: el contenido llega de la API (GET /api/paginas/historias). */
export default function Historias() {
    return <PaginaApi url="/paginas/historias">{(datos) => <HistoriasContenido {...datos} />}</PaginaApi>;
}
