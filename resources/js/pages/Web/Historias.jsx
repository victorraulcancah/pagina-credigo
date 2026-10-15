import { Link } from '@inertiajs/react';
import { ArrowRight, MapPin, MessageSquareQuote } from 'lucide-react';
import { useMemo, useState } from 'react';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Revelar from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import CtaSection from '@/components/web/CtaSection';
import PaginaApi from '@/components/web/PaginaApi';
import { Comentario, Estrellas, FotoConductor, TarjetaHistoria, tituloHistoria } from '@/components/web/Testimonios';
import { cn } from '@/lib/utils';

/** La primera historia, en grande: foto con zoom lento al aparecer, titular y su comentario. */
function Destacada({ testimonio }) {
    const url = `/historias/${testimonio.slug}`;

    return (
        <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <Revelar desde="izquierda">
                <Link href={url} className="group block aspect-[4/3] overflow-hidden rounded-[2rem] bg-primary-50" tabIndex={-1} aria-hidden="true">
                    <FotoConductor
                        testimonio={testimonio}
                        className="size-full object-top text-7xl transition-transform duration-700 ease-out group-hover:scale-105 motion-safe:animate-acercar"
                    />
                </Link>
            </Revelar>
            <Revelar desde="derecha" retraso={120}>
                <Estrellas valor={testimonio.calificacion} />
                <h2 className="mt-3 text-3xl leading-[1.1] font-bold tracking-[-0.03em] text-balance sm:text-4xl">
                    <Link href={url} className="transition hover:text-primary-600">
                        {tituloHistoria(testimonio)}
                    </Link>
                </h2>
                <Comentario texto={testimonio.comentario} className="mt-8" />
                <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-primary-700/80">
                    <span className="font-bold text-primary">{testimonio.nombre}</span>
                    {testimonio.ciudad && (
                        <span className="inline-flex items-center gap-1">
                            <MapPin className="size-4" aria-hidden="true" /> {testimonio.ciudad}
                        </span>
                    )}
                    {testimonio.vehiculo && <span>· {testimonio.vehiculo}</span>}
                </p>
                <Button href={url} icon={ArrowRight} iconPosition="right" className="mt-8">
                    Leer su historia
                </Button>
            </Revelar>
        </article>
    );
}

/** Mientras no haya historias publicadas: aviso y el siguiente paso (ver planes o cotizar). */
function SinHistorias() {
    return (
        <Revelar className="mx-auto flex max-w-2xl flex-col items-center border-y border-primary-100 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-accent">
                <MessageSquareQuote className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-6 text-2xl leading-tight font-bold tracking-[-0.02em] text-balance sm:text-3xl">Pronto compartiremos sus historias</h2>
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

/** Filtro por ciudad (solo si las historias son de más de una ciudad). */
function FiltroCiudades({ ciudades, actual, onCambiar }) {
    return (
        <div role="group" aria-label="Filtrar por ciudad" className="flex flex-wrap gap-2">
            {[null, ...ciudades].map((ciudad) => {
                const activa = actual === ciudad;
                return (
                    <button
                        key={ciudad ?? 'todas'}
                        type="button"
                        onClick={() => onCambiar(ciudad)}
                        aria-pressed={activa}
                        className={cn(
                            'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                            activa ? 'bg-primary text-white' : 'bg-primary-50 text-primary hover:bg-primary-100',
                        )}
                    >
                        {ciudad ?? 'Todas'}
                    </button>
                );
            })}
        </div>
    );
}

function HistoriasContenido({ secciones, testimonios }) {
    const hero = secciones['historias.hero'];
    const [ciudad, setCiudad] = useState(null);
    const ciudades = useMemo(() => [...new Set(testimonios.map((t) => t.ciudad?.trim()).filter(Boolean))].sort(), [testimonios]);

    // Sin filtro: la primera va destacada y el resto en tarjetas; con filtro, todas las de esa ciudad en tarjetas
    const [destacada, ...resto] = testimonios;
    const tarjetas = ciudad ? testimonios.filter((t) => t.ciudad?.trim() === ciudad) : resto;

    return (
        <PublicLayout title={hero?.titulo || 'Historias de conductores'}>
            <PageHero
                imagen={hero?.imagen_url}
                colorTitulo={hero?.color_titulo}
                colorTexto={hero?.color_texto}
                title={hero?.titulo || 'Historias de conductores'}
                description={hero?.contenido}
            />

            <Section>
                {testimonios.length === 0 ? (
                    <SinHistorias />
                ) : (
                    <>
                        {!ciudad && <Destacada testimonio={destacada} />}

                        {(ciudades.length > 1 || resto.length > 0) && (
                            <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', !ciudad && 'mt-20 border-t border-primary-100 pt-14')}>
                                <h2 className="text-2xl leading-tight font-bold tracking-[-0.02em] sm:text-3xl">
                                    {ciudad ? `Historias en ${ciudad}` : 'Más historias'}
                                </h2>
                                {ciudades.length > 1 && <FiltroCiudades ciudades={ciudades} actual={ciudad} onCambiar={setCiudad} />}
                            </div>
                        )}

                        {tarjetas.length > 0 && (
                            // key: al cambiar de ciudad las tarjetas vuelven a entrar animadas
                            <ul key={ciudad ?? 'todas'} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {tarjetas.map((testimonio, i) => (
                                    <TarjetaHistoria key={testimonio.id} testimonio={testimonio} indice={i} />
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

/** Historias de conductores (como un blog): el contenido llega de la API (GET /api/paginas/historias). */
export default function Historias() {
    return <PaginaApi url="/paginas/historias">{(datos) => <HistoriasContenido {...datos} />}</PaginaApi>;
}
