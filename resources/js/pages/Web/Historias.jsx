import { ArrowRight, Car, MapPin, MessageSquareQuote, Quote } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import CtaSection from '@/components/web/CtaSection';
import PaginaApi from '@/components/web/PaginaApi';
import { Estrellas, FotoConductor } from '@/components/web/Testimonios';
import { BotonVideo } from '@/components/web/Video';
import { cn } from '@/lib/utils';

/**
 * Una historia como tarjeta: la foto del conductor arriba (con la de su vehículo encima, en
 * una esquina), su comentario y al pie su nombre, ciudad y vehículo.
 * Entran una tras otra desde los costados; al pasar el mouse la foto se acerca, el vehículo
 * se levanta, las comillas giran y se dibuja la línea amarilla del pie.
 */
function TarjetaHistoria({ testimonio, indice }) {
    return (
        <Revelar as="li" desde={indice % 2 ? 'derecha' : 'izquierda'} retraso={escalonar(indice, 110)} className="h-full">
            <figure className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-white ring-1 ring-primary-100 transition duration-300 hover:ring-2 hover:ring-primary">
                <div className="relative aspect-[4/3] overflow-hidden bg-primary">
                    <FotoConductor
                        testimonio={testimonio}
                        alt={`Foto de ${testimonio.nombre}`}
                        className="size-full object-top text-7xl transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {/* Sin foto: las iniciales llevan el resplandor amarillo de la marca */}
                    {!testimonio.foto_url && (
                        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-96 resplandor-acento transition-transform duration-700 group-hover:scale-110" />
                    )}
                    {testimonio.ciudad && (
                        <span className="absolute top-5 left-5 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary">
                            <MapPin className="size-3.5" aria-hidden="true" /> {testimonio.ciudad}
                        </span>
                    )}
                    {testimonio.foto_vehiculo_url && (
                        <img
                            src={testimonio.foto_vehiculo_url}
                            alt={testimonio.vehiculo ? `Vehículo: ${testimonio.vehiculo}` : `Vehículo de ${testimonio.nombre}`}
                            loading="lazy"
                            className="absolute right-5 bottom-5 aspect-[4/3] w-[38%] max-w-56 rounded-2xl bg-white object-cover shadow-xl shadow-primary/30 ring-4 ring-white transition duration-500 ease-out group-hover:-translate-y-2 group-hover:-rotate-2"
                        />
                    )}
                </div>

                <div className="relative flex flex-1 flex-col p-7 sm:p-8">
                    <div className="flex items-center justify-between gap-4">
                        <span
                            aria-hidden="true"
                            className="flex size-11 items-center justify-center rounded-full bg-accent text-primary transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-12"
                        >
                            <Quote className="size-5 fill-current" />
                        </span>
                        <Estrellas valor={testimonio.calificacion} />
                    </div>

                    <blockquote className="mt-5 text-lg leading-snug font-semibold text-pretty text-primary sm:text-xl">“{testimonio.comentario}”</blockquote>

                    <figcaption className="mt-8 flex flex-1 flex-wrap items-end justify-between gap-x-4 gap-y-3">
                        <div className="w-full border-t border-primary-100 pt-6 sm:flex sm:items-end sm:justify-between sm:gap-4">
                            <div className="min-w-0">
                                <p className="text-lg font-bold">{testimonio.nombre}</p>
                                {testimonio.vehiculo && (
                                    <p className="mt-1 flex items-center gap-1.5 text-sm text-primary-700/80">
                                        <Car className="size-4 shrink-0" aria-hidden="true" /> {testimonio.vehiculo}
                                    </p>
                                )}
                            </div>
                            {testimonio.video_url && (
                                <BotonVideo url={testimonio.video_url} titulo={`La historia de ${testimonio.nombre}`} enlace className="mt-3 shrink-0 text-sm font-semibold sm:mt-0">
                                    Ver su video
                                </BotonVideo>
                            )}
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
                    // Con una sola historia, la tarjeta va centrada
                    <ul className={cn('grid gap-8', testimonios.length > 1 ? 'md:grid-cols-2' : 'mx-auto max-w-2xl')}>
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
