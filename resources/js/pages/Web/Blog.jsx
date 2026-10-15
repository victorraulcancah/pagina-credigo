import { Link } from '@inertiajs/react';
import { ArrowRight, Newspaper } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Revelar from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import { ChipCategoria, MetaArticulo, PortadaArticulo, TarjetaArticulo, urlArticulo } from '@/components/web/Blog';
import CtaSection from '@/components/web/CtaSection';
import PaginaApi from '@/components/web/PaginaApi';
import { cn } from '@/lib/utils';

/** El artículo destacado (o el más nuevo) en grande: portada con zoom lento al aparecer. */
function Destacado({ articulo }) {
    const url = urlArticulo(articulo);

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

/** Sin artículos publicados (en todo el blog o en esa categoría). */
function SinArticulos({ categoria }) {
    return (
        <Revelar className="mx-auto flex max-w-2xl flex-col items-center border-y border-primary-100 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-accent">
                <Newspaper className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-6 text-2xl leading-tight font-bold tracking-[-0.02em] text-balance sm:text-3xl">
                {categoria ? `Todavía no hay publicaciones en ${categoria.nombre}` : 'Pronto publicaremos nuestros primeros artículos'}
            </h2>
            <p className="mt-3 max-w-lg text-lg text-pretty text-primary-700/80">
                {categoria ? 'Vuelve pronto o mira lo que ya publicamos en el blog.' : 'Aquí compartiremos eventos, noticias y tendencias para los conductores.'}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {categoria ? (
                    <Button href="/blog" icon={ArrowRight} iconPosition="right">
                        Ver todo el blog
                    </Button>
                ) : (
                    <Button href="/servicios" icon={ArrowRight} iconPosition="right">
                        Ver planes
                    </Button>
                )}
                <Button href="/cotizador" variant="outline">
                    Cotiza tu plan
                </Button>
            </div>
        </Revelar>
    );
}

/** Categorías como enlaces: Todas · Eventos · Noticias · Tendencias (cada una con su página). */
function Categorias({ categorias, actual }) {
    const opciones = [{ id: null, nombre: 'Todas', url: '/blog' }, ...categorias.map((c) => ({ ...c, url: `/blog/${c.slug}` }))];

    return (
        <nav aria-label="Categorías del blog" className="flex flex-wrap gap-2">
            {opciones.map((opcion) => {
                const activa = (actual?.id ?? null) === opcion.id;
                return (
                    <Link
                        key={opcion.url}
                        href={opcion.url}
                        preserveScroll
                        aria-current={activa ? 'page' : undefined}
                        className={cn(
                            'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                            activa ? 'bg-primary text-white' : 'bg-primary-50 text-primary hover:bg-primary-100',
                        )}
                    >
                        {opcion.nombre}
                    </Link>
                );
            })}
        </nav>
    );
}

function BlogContenido({ secciones, articulos, categorias, categoria }) {
    const hero = secciones['blog.hero'];

    // En /blog el destacado (o el más nuevo) va en grande y el resto en tarjetas;
    // en la página de una categoría, todos sus artículos en tarjetas
    const destacado = categoria ? null : (articulos.find((a) => a.destacado) ?? articulos[0]);
    const tarjetas = articulos.filter((a) => a !== destacado);

    return (
        <PublicLayout title={categoria ? `${categoria.nombre} · Blog` : hero?.titulo || 'Blog'} description={hero?.contenido}>
            <PageHero
                imagen={hero?.imagen_url}
                colorTitulo={hero?.color_titulo}
                colorTexto={hero?.color_texto}
                title={categoria?.nombre ?? (hero?.titulo || 'Blog')}
                description={hero?.contenido}
            />

            <Section>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Categorias categorias={categorias} actual={categoria} />
                    {articulos.length > 0 && (
                        <p className="text-sm text-primary-700/70">
                            {articulos.length} {articulos.length === 1 ? 'publicación' : 'publicaciones'}
                        </p>
                    )}
                </div>

                <div className="mt-10">
                    {articulos.length === 0 ? (
                        <SinArticulos categoria={categoria} />
                    ) : (
                        <>
                            {destacado && <Destacado articulo={destacado} />}

                            {tarjetas.length > 0 && (
                                <>
                                    {destacado && (
                                        <h2 className="mt-20 border-t border-primary-100 pt-14 text-2xl leading-tight font-bold tracking-[-0.02em] sm:text-3xl">
                                            Más publicaciones
                                        </h2>
                                    )}
                                    {/* key: al cambiar de categoría las tarjetas vuelven a entrar animadas */}
                                    <ul key={categoria?.id ?? 'todas'} className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', destacado && 'mt-8')}>
                                        {tarjetas.map((articulo, i) => (
                                            <TarjetaArticulo key={articulo.id} articulo={articulo} indice={i} />
                                        ))}
                                    </ul>
                                </>
                            )}
                        </>
                    )}
                </div>
            </Section>

            <CtaSection seccion={secciones['general.cta']} whatsappPrimero />
        </PublicLayout>
    );
}

/**
 * Blog de la empresa: todo (/blog) o una categoría (/blog/eventos, /blog/noticias, /blog/tendencias).
 * El contenido llega de la API (GET /api/paginas/blog[/{categoria}]).
 */
export default function Blog({ categoria }) {
    const url = categoria ? `/paginas/blog/${categoria}` : '/paginas/blog';

    return (
        <PaginaApi key={url} url={url}>
            {(datos) => <BlogContenido {...datos} />}
        </PaginaApi>
    );
}
