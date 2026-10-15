import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Car, MapPin } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Revelar from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import CtaSection from '@/components/web/CtaSection';
import PaginaApi from '@/components/web/PaginaApi';
import { Comentario, Estrellas, FotoConductor, TarjetaHistoria, tituloHistoria } from '@/components/web/Testimonios';
import Video from '@/components/web/Video';
import { cn } from '@/lib/utils';

/** Encabezado azul: la foto se descubre de abajo hacia arriba y al lado el titular y sus datos. */
function Encabezado({ testimonio }) {
    return (
        <section className="relative overflow-clip bg-primary text-white">
            <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-32 size-96 resplandor-acento" />
            <Container className="relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:py-20">
                <div className="order-2 mx-auto w-full max-w-xs sm:max-w-sm lg:order-none lg:max-w-none">
                    <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-primary-800 motion-safe:animate-cortina">
                        <FotoConductor
                            testimonio={testimonio}
                            alt={`Foto de ${testimonio.nombre}`}
                            className="size-full object-top text-8xl motion-safe:animate-acercar"
                        />
                    </div>
                </div>
                {/* En celular el titular va primero (como en un blog) y la foto debajo */}
                <div className="order-1 lg:order-none">
                    <Revelar>
                        <Link href="/historias" className="group inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white">
                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                            Historias de conductores
                        </Link>
                    </Revelar>
                    <Revelar as="h1" retraso={100} className="mt-5 text-4xl leading-[1.04] font-bold tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl">
                        {tituloHistoria(testimonio)}
                    </Revelar>
                    <Revelar retraso={200} className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-white/80">
                        <span className="text-xl font-bold text-white">{testimonio.nombre}</span>
                        {testimonio.ciudad && (
                            <span className="inline-flex items-center gap-1.5">
                                <MapPin className="size-4" aria-hidden="true" /> {testimonio.ciudad}
                            </span>
                        )}
                        <Estrellas valor={testimonio.calificacion} claro />
                    </Revelar>
                    {testimonio.vehiculo && (
                        <Revelar retraso={280} className="mt-4">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15">
                                <Car className="size-4 text-accent" aria-hidden="true" /> {testimonio.vehiculo}
                            </span>
                        </Revelar>
                    )}
                </div>
            </Container>
        </section>
    );
}

/** La historia completa: un párrafo por cada línea en blanco que dejaron en el panel. */
function Relato({ texto }) {
    const parrafos = (texto ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    if (!parrafos.length) return null;

    return (
        <div className="mx-auto mt-14 flex max-w-[65ch] flex-col gap-6 text-lg leading-relaxed text-primary-800">
            {parrafos.map((parrafo, i) => (
                <Revelar key={i} as="p" className={cn('whitespace-pre-line', i === 0 && 'first-letter:float-left first-letter:mr-2 first-letter:text-6xl first-letter:leading-[0.85] first-letter:font-bold')}>
                    {parrafo}
                </Revelar>
            ))}
        </div>
    );
}

/** Compartir la historia por WhatsApp (el enlace lleva la vista previa con su foto). */
function Compartir({ testimonio }) {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const texto = `${tituloHistoria(testimonio)} — ${url}`;

    return (
        <Revelar className="mx-auto mt-14 flex max-w-[65ch] flex-col items-start gap-4 border-t border-primary-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold">¿Te inspiró? Compártela con otro conductor.</p>
            <Button href={`https://wa.me/?text=${encodeURIComponent(texto)}`} newTab variant="secondary" icon={FaWhatsapp}>
                Compartir por WhatsApp
            </Button>
        </Revelar>
    );
}

function HistoriaContenido({ secciones, testimonio, otros }) {
    const conMedios = testimonio.foto_vehiculo_url || testimonio.video_url;

    return (
        <PublicLayout title={tituloHistoria(testimonio)} description={testimonio.comentario}>
            <Encabezado testimonio={testimonio} />

            <Section>
                <Revelar desde="zoom" className="mx-auto max-w-3xl">
                    <Comentario texto={testimonio.comentario} />
                </Revelar>

                <Relato texto={testimonio.historia} />

                {conMedios && (
                    <div className={cn('mx-auto mt-14 grid max-w-4xl gap-6', testimonio.foto_vehiculo_url && testimonio.video_url && 'md:grid-cols-2 md:items-center')}>
                        {testimonio.foto_vehiculo_url && (
                            <Revelar as="figure" desde="izquierda">
                                <img
                                    src={testimonio.foto_vehiculo_url}
                                    alt={testimonio.vehiculo ? `Vehículo: ${testimonio.vehiculo}` : `Vehículo de ${testimonio.nombre}`}
                                    loading="lazy"
                                    className="max-h-[28rem] w-full rounded-[1.5rem] bg-primary-50 object-contain"
                                />
                                {testimonio.vehiculo && <figcaption className="mt-3 text-center text-sm text-primary-700/80">{testimonio.vehiculo}</figcaption>}
                            </Revelar>
                        )}
                        {testimonio.video_url && (
                            <Revelar desde="derecha" retraso={120}>
                                <Video url={testimonio.video_url} titulo={`La historia de ${testimonio.nombre}`} />
                            </Revelar>
                        )}
                    </div>
                )}

                <Compartir testimonio={testimonio} />
            </Section>

            {otros.length > 0 && (
                <Section background="muted">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <h2 className="text-3xl leading-tight font-bold tracking-[-0.03em] sm:text-4xl">Más historias</h2>
                        <Button href="/historias" variant="outline" icon={ArrowRight} iconPosition="right" className="self-start sm:self-auto">
                            Ver todas
                        </Button>
                    </div>
                    <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {otros.map((otro, i) => (
                            <TarjetaHistoria key={otro.id} testimonio={otro} indice={i} />
                        ))}
                    </ul>
                </Section>
            )}

            <CtaSection seccion={secciones['general.cta']} whatsappPrimero />
        </PublicLayout>
    );
}

/** Página de una historia (/historias/{slug}): el contenido llega de la API (GET /api/paginas/historias/{slug}). */
export default function Historia({ slug }) {
    return <PaginaApi url={`/paginas/historias/${slug}`}>{(datos) => <HistoriaContenido {...datos} />}</PaginaApi>;
}
