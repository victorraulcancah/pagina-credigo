import { BadgePercent, CalendarClock, MapPin, Smartphone } from 'lucide-react';
import { useMemo, useState } from 'react';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import FeatureCard from '@/components/ui/FeatureCard';
import Icono from '@/components/ui/Icono';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import { ContactoAliado, DatosAliado, LogoAliado } from '@/components/web/Aliados';
import CtaSection from '@/components/web/CtaSection';
import NivelesSection from '@/components/web/NivelesSection';
import Semana from '@/components/web/Semana';
import { formatoFecha } from '@/lib/fechas';
import { formatoMoneda } from '@/lib/moneda';
import { cn, columnasLg } from '@/lib/utils';

// Color de cada rango de puntaje, en el orden de la lista (de mayor a menor)
const COLORES_RANGO = [
    { barra: 'bg-emerald-500', suave: 'bg-emerald-50 text-emerald-800' },
    { barra: 'bg-lime-500', suave: 'bg-lime-50 text-lime-800' },
    { barra: 'bg-amber-400', suave: 'bg-amber-50 text-amber-800' },
    { barra: 'bg-red-500', suave: 'bg-red-50 text-red-800' },
];

function PuntajeSection({ reglas, rangos }) {
    if (!reglas && !rangos) return null;
    const listaReglas = reglas?.items ?? [];
    const listaRangos = rangos?.items ?? [];

    return (
        <Section>
            {reglas && (
                <>
                    <Revelar>
                        <SectionHeading eyebrow={reglas.subtitulo} title={reglas.titulo} description={reglas.contenido} />
                    </Revelar>
                    {listaReglas.length > 0 && (
                        <div className={cn('mt-12 grid gap-6 sm:grid-cols-2', columnasLg(listaReglas.length))}>
                            {listaReglas.map((regla, i) => (
                                <Revelar key={i} retraso={escalonar(i)} className="h-full">
                                    <FeatureCard
                                        icon={(props) => <Icono nombre={regla.icono} {...props} />}
                                        title={regla.titulo}
                                        description={regla.descripcion}
                                    />
                                </Revelar>
                            ))}
                        </div>
                    )}
                </>
            )}

            {rangos && listaRangos.length > 0 && (
                <div className={cn(reglas && 'mt-16 sm:mt-20')}>
                    <Revelar>
                        <SectionHeading eyebrow={rangos.subtitulo} title={rangos.titulo} description={rangos.contenido} />
                    </Revelar>
                    <div className={cn('mt-10 grid gap-4 sm:grid-cols-2', columnasLg(listaRangos.length))}>
                        {listaRangos.map((rango, i) => {
                            const color = COLORES_RANGO[i] ?? COLORES_RANGO[COLORES_RANGO.length - 1];
                            return (
                                <Revelar key={i} desde="zoom" retraso={escalonar(i)} className="h-full">
                                    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-primary-100">
                                        <span aria-hidden="true" className={cn('h-2', color.barra)} />
                                        <div className="flex flex-1 flex-col p-6">
                                            <p className={cn('self-start rounded-full px-3 py-1 text-sm font-bold', color.suave)}>{rango.titulo}</p>
                                            {rango.descripcion && <p className="mt-3 text-sm text-primary-700/80 sm:text-base">{rango.descripcion}</p>}
                                        </div>
                                    </article>
                                </Revelar>
                            );
                        })}
                    </div>
                </div>
            )}
        </Section>
    );
}

/** Texto del descuento: "5 %" o "S/ 200" (sin valor no se muestra). */
const descuento = (cupon) => {
    if (!cupon.valor) return null;
    return cupon.tipo_descuento === 'monto' ? formatoMoneda(cupon.valor) : `${cupon.valor} %`;
};

function CuponCard({ cupon }) {
    const [sinImagen, setSinImagen] = useState(!cupon.imagen_url);
    const valor = descuento(cupon);

    return (
        <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-primary-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
            <div className="relative aspect-video bg-primary">
                {!sinImagen ? (
                    <img src={cupon.imagen_url} alt="" loading="lazy" onError={() => setSinImagen(true)} className="size-full object-cover" />
                ) : (
                    <div className="flex size-full items-center justify-center overflow-clip">
                        <div aria-hidden="true" className="absolute -top-10 -right-10 size-40 resplandor-acento" />
                        <BadgePercent className="relative size-14 text-accent" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                )}
                {valor && (
                    <span className="absolute top-3 left-3 rounded-full bg-accent px-3 py-1 text-sm font-extrabold text-primary shadow">{valor}</span>
                )}
            </div>
            <div className="flex flex-1 flex-col p-5">
                <h3 className="line-clamp-2 font-bold text-primary">{cupon.titulo}</h3>
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-primary-500">
                    <li className="flex items-center gap-1">
                        <MapPin className="size-3.5" aria-hidden="true" /> {cupon.ciudad ?? 'Todas las ciudades'}
                    </li>
                    {cupon.hasta && (
                        <li className="flex items-center gap-1">
                            <CalendarClock className="size-3.5" aria-hidden="true" /> Hasta el {formatoFecha(`${cupon.hasta}T12:00:00`, false)}
                        </li>
                    )}
                </ul>
                {cupon.descripcion && (
                    <details className="group mt-3">
                        <summary className="cursor-pointer list-none text-sm font-semibold text-primary-500 hover:text-primary [&::-webkit-details-marker]:hidden">
                            <span className="group-open:hidden">Ver detalle</span>
                            <span className="hidden group-open:inline">Ocultar detalle</span>
                        </summary>
                        <p className="mt-2 text-sm whitespace-pre-line text-primary-700/80">{cupon.descripcion}</p>
                    </details>
                )}
                <p className="mt-auto flex items-center gap-2 pt-4 text-xs font-semibold text-primary">
                    <Smartphone className="size-4" aria-hidden="true" /> Úsalo desde la app CrediGO
                </p>
            </div>
        </article>
    );
}

function ComercioCard({ comercio }) {
    return (
        <article className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
            <div className="mb-5 flex items-start gap-4">
                <LogoAliado nombre={comercio.nombre} logoUrl={comercio.logo_url} className="size-14 text-base" />
                <div className="min-w-0">
                    <h3 className="line-clamp-2 leading-snug font-bold text-primary">{comercio.nombre}</h3>
                    {comercio.categoria && <p className="mt-0.5 text-sm text-primary-500">{comercio.categoria.nombre}</p>}
                </div>
            </div>
            {comercio.descripcion && <p className="mb-4 line-clamp-3 text-sm text-primary-700/80">{comercio.descripcion}</p>}
            <DatosAliado aliado={comercio} />
            <div className="mt-auto flex items-center gap-2 pt-6">
                <ContactoAliado aliado={comercio} />
            </div>
        </article>
    );
}

function ComerciosSection({ seccion, comercios }) {
    const [categoria, setCategoria] = useState('');
    const categorias = useMemo(() => [...new Set(comercios.map((c) => c.categoria?.nombre).filter(Boolean))].sort(), [comercios]);
    const visibles = categoria ? comercios.filter((c) => c.categoria?.nombre === categoria) : comercios;

    return (
        <Section background="muted">
            <Revelar>
                <SectionHeading eyebrow={seccion?.subtitulo} title={seccion?.titulo || 'Comercios GO'} description={seccion?.contenido} />
            </Revelar>
            {categorias.length > 1 && (
                <div className="mt-8 flex flex-wrap justify-center gap-2" role="group" aria-label="Filtrar por categoría">
                    {['', ...categorias].map((opcion) => (
                        <button
                            key={opcion || 'todas'}
                            type="button"
                            onClick={() => setCategoria(opcion)}
                            aria-pressed={categoria === opcion}
                            className={cn(
                                'rounded-full px-4 py-2 text-sm font-semibold transition',
                                categoria === opcion ? 'bg-primary text-white' : 'bg-white text-primary ring-1 ring-primary-100 hover:ring-primary-300',
                            )}
                        >
                            {opcion || 'Todas'}
                        </button>
                    ))}
                </div>
            )}
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibles.map((comercio, i) => (
                    <Revelar key={comercio.id} retraso={escalonar(i, 100)} className="h-full">
                        <ComercioCard comercio={comercio} />
                    </Revelar>
                ))}
            </div>
        </Section>
    );
}

/** La semana del conductor sobre el azul de marca: cómo la cuota baja si cumple su meta de viajes. */
function SemanaSection({ seccion, cuotaSemanal }) {
    if (!seccion?.items?.length) return null;

    return (
        // Sigue al encabezado azul: una línea fina los separa
        <Section background="dark" className="border-t border-white/10">
            <Revelar>
                <SectionHeading title={seccion.titulo} align="left" light />
            </Revelar>
            <div className="mt-10">
                <Semana seccion={seccion} cuota={cuotaSemanal && formatoMoneda(cuotaSemanal.cuota, cuotaSemanal.moneda)} />
            </div>
        </Section>
    );
}

/** Beneficios: la semana con descuento por viajes, puntaje y niveles (textos del panel) + cupones y Comercios GO (vienen del ERP). */
export default function Beneficios({ secciones, cuotaSemanal, comercios, cupones }) {
    const hero = secciones['beneficios.hero'];
    const seccionCupones = secciones['beneficios.cupones'];

    return (
        <PublicLayout title="Beneficios" description={hero?.contenido}>
            <PageHero imagen={hero?.imagen_url} title={hero?.titulo || 'Beneficios'} description={hero?.contenido} />

            <SemanaSection seccion={secciones['beneficios.semana']} cuotaSemanal={cuotaSemanal} />

            <PuntajeSection reglas={secciones['beneficios.puntaje']} rangos={secciones['beneficios.rangos']} />

            <NivelesSection seccion={secciones['beneficios.niveles']} background="muted" />

            {cupones.length > 0 && (
                <Section id="cupones" background="white">
                    <Revelar>
                        <SectionHeading eyebrow={seccionCupones?.subtitulo} title={seccionCupones?.titulo || 'Cupones'} description={seccionCupones?.contenido} />
                    </Revelar>
                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {cupones.map((cupon, i) => (
                            <Revelar key={cupon.id} retraso={escalonar(i, 100)} className="h-full">
                                <CuponCard cupon={cupon} />
                            </Revelar>
                        ))}
                    </div>
                </Section>
            )}

            {comercios.length > 0 && <ComerciosSection seccion={secciones['beneficios.comercios']} comercios={comercios} />}

            <CtaSection seccion={secciones['general.cta']} />
        </PublicLayout>
    );
}
