import { Link } from '@inertiajs/react';
import { ArrowRight, Newspaper } from 'lucide-react';
import { useState } from 'react';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Revelar from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import { ChipCategoria, MetaArticulo, PortadaArticulo, TarjetaArticulo } from '@/components/web/Blog';
import CtaSection from '@/components/web/CtaSection';
import PaginaApi from '@/components/web/PaginaApi';
import { cn } from '@/lib/utils';

/** El artículo destacado (o el más nuevo) en grande: portada con zoom lento al aparecer. */
function Destacado({ articulo }) {
    const url = `/blog/${articulo.slug}`;

    return (
        <article className="group grid items-center gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
            <Revelar desde="izquierda">
                <Link href={url} tabIndex={-1} aria-hidden="true" className="relative block aspect-[16/10] overflow-hidden rounded-[2rem]">
                    <PortadaArticulo
                        articulo={articulo}
                        prioridad
                        className="absolute inset-0"
                        imgClassName="transition-transform duration-700 ease-out group-hover:scale-105 motion-safe:animate-acercar"
                    />
                </Link>
            </Revelar>
            <Revelar desde="derecha" retraso={120}>
                <ChipCategoria categoria={articulo.categoria} />
                <h2 className="mt-4 text-3xl leading-[1.08] font-bold tracking-[-0.03em] text-balance sm:text-4xl">
                    <Link href={url} className="transition hover:text-primary-600">
                        {articulo.titulo}
                    </Link>
                </h2>
                {articulo.resumen && <p className="mt-4 text-lg text-pretty text-primary-700/80">{articulo.resumen}</p>}
                <MetaArticulo articulo={articulo} className="mt-5 text-primary-700/70" />
                <Button href={url} icon={ArrowRight} iconPosition="right" className="mt-8">
                    Leer artículo
                </Button>
            </Revelar>
        </article>
    );
}

/** Mientras no haya artículos publicados. */
function SinArticulos() {
    return (
        <Revelar className="mx-auto flex max-w-2xl flex-col items-center border-y border-primary-100 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-accent">
                <Newspaper className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-6 text-2xl leading-tight font-bold tracking-[-0.02em] text-balance sm:text-3xl">Pronto publicaremos nuestros primeros artículos</h2>
            <p className="mt-3 max-w-lg text-lg text-pretty text-primary-700/80">
                Aquí compartiremos noticias, consejos y novedades para los conductores. Mientras tanto, conoce nuestros planes.
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

/** Filtro por categoría (solo las que tienen artículos). */
function FiltroCategorias({ categorias, actual, onCambiar }) {
    return (
        <div role="group" aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
            {[null, ...categorias].map((categoria) => {
                const activa = (actual?.id ?? null) === (categoria?.id ?? null);
                return (
                    <button
                        key={categoria?.id ?? 'todas'}
                        type="button"
                        onClick={() => onCambiar(categoria)}
                        aria-pressed={activa}
                        className={cn(
                            'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                            activa ? 'bg-primary text-white' : 'bg-primary-50 text-primary hover:bg-primary-100',
                        )}
                    >
                        {categoria?.nombre ?? 'Todos'}
                    </button>
                );
            })}
        </div>
    );
}

function BlogContenido({ secciones, articulos, categorias }) {
    const hero = secciones['blog.hero'];
    const [categoria, setCategoria] = useState(null);

    // Sin filtro: el destacado (o el más nuevo) va en grande y el resto en la grilla
    const destacado = articulos.find((a) => a.destacado) ?? articulos[0];
    const tarjetas = categoria ? articulos.filter((a) => a.categoria?.id === categoria.id) : articulos.filter((a) => a !== destacado);

    return (
        <PublicLayout title={hero?.titulo || 'Blog'} description={hero?.contenido}>
            <PageHero
                imagen={hero?.imagen_url}
                colorTitulo={hero?.color_titulo}
                colorTexto={hero?.color_texto}
                title={hero?.titulo || 'Blog'}
                description={hero?.contenido}
            />

            <Section>
                {articulos.length === 0 ? (
                    <SinArticulos />
                ) : (
                    <>
                        {!categoria && <Destacado articulo={destacado} />}

                        {(categorias.length > 1 || tarjetas.length > 0) && (
                            <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', !categoria && 'mt-20 border-t border-primary-100 pt-14')}>
                                <h2 className="text-2xl leading-tight font-bold tracking-[-0.02em] sm:text-3xl">{categoria ? categoria.nombre : 'Más artículos'}</h2>
                                {categorias.length > 1 && <FiltroCategorias categorias={categorias} actual={categoria} onCambiar={setCategoria} />}
                            </div>
                        )}

                        {tarjetas.length > 0 && (
                            // key: al cambiar de categoría las tarjetas vuelven a entrar animadas
                            <ul key={categoria?.id ?? 'todos'} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {tarjetas.map((articulo, i) => (
                                    <TarjetaArticulo key={articulo.id} articulo={articulo} indice={i} />
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </Section>

            <CtaSection seccion={secciones['general.cta']} whatsappPrimero />
        </PublicLayout>
    );
}

/** Blog de la empresa: el contenido llega de la API (GET /api/paginas/blog). */
export default function Blog() {
    return <PaginaApi url="/paginas/blog">{(datos) => <BlogContenido {...datos} />}</PaginaApi>;
}
