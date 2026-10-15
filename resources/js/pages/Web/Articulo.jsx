import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Link2 } from 'lucide-react';
import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Revelar from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import { ChipCategoria, MetaArticulo, PortadaArticulo, TarjetaArticulo } from '@/components/web/Blog';
import CtaSection from '@/components/web/CtaSection';
import PaginaApi from '@/components/web/PaginaApi';
import TextoFormateado from '@/components/web/TextoFormateado';
import Video from '@/components/web/Video';

/** Encabezado azul con la categoría, el título, el resumen y la fecha; los textos entran uno tras otro. */
function Encabezado({ articulo }) {
    return (
        <section className="relative overflow-clip bg-primary pb-28 text-white sm:pb-36">
            <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-32 size-96 resplandor-acento" />
            <Container className="relative pt-12 sm:pt-16 lg:pt-20">
                <div className="mx-auto max-w-3xl">
                    {/* Migas: Blog / Categoría */}
                    <Revelar as="nav" aria-label="Estás en" className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white/70">
                        <Link href="/blog" className="group inline-flex items-center gap-2 transition hover:text-white">
                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" /> Blog
                        </Link>
                        {articulo.categoria && (
                            <>
                                <span aria-hidden="true">/</span>
                                <Link href={`/blog/${articulo.categoria.slug}`} className="transition hover:text-white">
                                    {articulo.categoria.nombre}
                                </Link>
                            </>
                        )}
                    </Revelar>
                    {articulo.categoria && (
                        <Revelar retraso={80} className="mt-6">
                            <ChipCategoria categoria={articulo.categoria} claro />
                        </Revelar>
                    )}
                    <Revelar as="h1" retraso={140} className="mt-4 text-4xl leading-[1.05] font-bold tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl">
                        {articulo.titulo}
                    </Revelar>
                    {articulo.resumen && (
                        <Revelar as="p" retraso={220} className="mt-5 text-lg text-pretty text-white/80 sm:text-xl">
                            {articulo.resumen}
                        </Revelar>
                    )}
                    <Revelar retraso={300} className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-white/70">
                        {articulo.autor && <span className="font-semibold text-white">{articulo.autor}</span>}
                        {articulo.autor && <span aria-hidden="true">·</span>}
                        <MetaArticulo articulo={articulo} />
                    </Revelar>
                </div>
            </Container>
        </section>
    );
}

/** Compartir por WhatsApp o copiar el enlace. */
function Compartir({ articulo }) {
    const [copiado, setCopiado] = useState(false);
    const url = typeof window !== 'undefined' ? window.location.href : '';

    const copiar = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        } catch {
            // Sin permiso para el portapapeles: no pasa nada, queda el botón de WhatsApp
        }
    };

    return (
        <Revelar className="mt-14 flex flex-col gap-4 border-t border-primary-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold">¿Te sirvió? Compártelo.</p>
            <div className="flex flex-wrap gap-3">
                <Button href={`https://wa.me/?text=${encodeURIComponent(`${articulo.titulo} — ${url}`)}`} newTab variant="secondary" icon={FaWhatsapp}>
                    WhatsApp
                </Button>
                <Button variant="outline" icon={Link2} onClick={copiar} aria-live="polite">
                    {copiado ? '¡Enlace copiado!' : 'Copiar enlace'}
                </Button>
            </div>
        </Revelar>
    );
}

function ArticuloContenido({ secciones, articulo, relacionados }) {
    return (
        <PublicLayout title={articulo.titulo} description={articulo.resumen}>
            <Encabezado articulo={articulo} />

            {/* La portada se monta sobre el encabezado y se descubre de abajo hacia arriba */}
            <Container className="relative -mt-20 sm:-mt-28">
                <PortadaArticulo
                    articulo={articulo}
                    prioridad
                    className="mx-auto aspect-[16/9] max-w-5xl rounded-[2rem] ring-8 ring-white motion-safe:animate-cortina"
                    imgClassName="motion-safe:animate-acercar"
                />
            </Container>

            <Section className="pt-12 sm:pt-16 lg:pt-16">
                <article className="mx-auto max-w-[68ch]">
                    <TextoFormateado
                        texto={articulo.contenido}
                        className="gap-6 text-lg leading-relaxed text-primary-800 sm:text-xl"
                        primerParrafo="first-letter:float-left first-letter:mr-3 first-letter:text-7xl first-letter:leading-[0.8] first-letter:font-bold first-letter:text-primary"
                    />

                    {articulo.video_url && (
                        <Revelar className="mt-12">
                            <Video url={articulo.video_url} titulo={articulo.titulo} />
                        </Revelar>
                    )}

                    <Compartir articulo={articulo} />
                </article>
            </Section>

            {relacionados.length > 0 && (
                <Section background="muted">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <h2 className="text-3xl leading-tight font-bold tracking-[-0.03em] sm:text-4xl">Sigue leyendo</h2>
                        <Button
                            href={articulo.categoria ? `/blog/${articulo.categoria.slug}` : '/blog'}
                            variant="outline"
                            icon={ArrowRight}
                            iconPosition="right"
                            className="self-start sm:self-auto"
                        >
                            {articulo.categoria ? `Más de ${articulo.categoria.nombre}` : 'Ver todo el blog'}
                        </Button>
                    </div>
                    <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {relacionados.map((relacionado, i) => (
                            <TarjetaArticulo key={relacionado.id} articulo={relacionado} indice={i} />
                        ))}
                    </ul>
                </Section>
            )}

            <CtaSection seccion={secciones['general.cta']} whatsappPrimero />
        </PublicLayout>
    );
}

/** Artículo del blog (/blog/{categoria}/{slug}): el contenido llega de la API (GET /api/paginas/blog/{categoria}/{slug}). */
export default function Articulo({ categoria, slug }) {
    const url = `/paginas/blog/${categoria}/${slug}`;

    return (
        <PaginaApi key={url} url={url}>
            {(datos) => <ArticuloContenido {...datos} />}
        </PaginaApi>
    );
}
