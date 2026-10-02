import { MessageCircle, Navigation, Search, Star, Wrench, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import { ContactoAliado, DatosAliado, LogoAliado, lugar } from '@/components/web/Aliados';
import CtaSection from '@/components/web/CtaSection';
import { DocumentosBloque, DocumentosSection } from '@/components/web/Documentos';
import PasosSection from '@/components/web/PasosSection';
import { useSitio } from '@/hooks/useSitio';
import { DIAS_SEMANA } from '@/lib/horario';
import { FRECUENCIAS, formatoMoneda } from '@/lib/moneda';
import { cn } from '@/lib/utils';

// Búsqueda sin tildes ni mayúsculas ("bateria" encuentra "BATERÍAS")
const normalizar = (texto = '') =>
    texto
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase();

const dinero = (valor, moneda) => formatoMoneda(valor, moneda === '$' ? 'USD' : 'PEN');

function Calificacion({ taller, claro = false }) {
    if (!taller.resenas || taller.calificacion === null) {
        return <p className={cn('text-sm', claro ? 'text-white/60' : 'text-primary-400')}>Sin calificaciones aún</p>;
    }

    return (
        <p className="flex items-center gap-1 text-sm font-semibold">
            <Star className="size-4 fill-accent text-accent" aria-hidden="true" />
            {taller.calificacion.toFixed(1)}
            <span className={cn('font-normal', claro ? 'text-white/60' : 'text-primary-500')}>
                ({taller.resenas} {taller.resenas === 1 ? 'reseña' : 'reseñas'})
            </span>
        </p>
    );
}

function TallerCard({ taller, onVer }) {
    return (
        <article className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
            <div className="mb-5 flex items-start gap-4">
                <LogoAliado nombre={taller.nombre} logoUrl={taller.logo_url} className="size-16 text-lg" />
                <div className="min-w-0">
                    <h3 className="line-clamp-2 text-lg leading-snug font-bold text-primary">{taller.nombre}</h3>
                    <div className="mt-1">
                        <Calificacion taller={taller} />
                    </div>
                </div>
            </div>

            <DatosAliado aliado={taller}>
                <li className="flex items-center gap-2">
                    <Wrench className="size-4 shrink-0 text-primary-400" aria-hidden="true" />
                    {taller.servicios.length} {taller.servicios.length === 1 ? 'servicio financiado' : 'servicios financiados'}
                </li>
            </DatosAliado>

            {taller.servicios.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                    {taller.servicios.slice(0, 3).map((servicio) => (
                        <li key={servicio.id} className="max-w-full truncate rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary">
                            {servicio.nombre}
                        </li>
                    ))}
                    {taller.servicios.length > 3 && (
                        <li className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-primary">+{taller.servicios.length - 3}</li>
                    )}
                </ul>
            )}

            <div className="mt-auto flex items-center gap-2 pt-6">
                <Button variant="secondary" size="sm" onClick={() => onVer(taller)} className="flex-1">
                    Ver servicios
                </Button>
                <ContactoAliado aliado={taller} />
            </div>
        </article>
    );
}

/** Precio del servicio: cerrado (inicial + cuotas) o solo condiciones (% de inicial y cuotas). */
function PrecioServicio({ servicio }) {
    const plural = FRECUENCIAS[servicio.frecuencia]?.plural ?? '';
    const { precio, moneda } = servicio;

    if (precio && precio.cuotas > 0) {
        return (
            <p className="text-sm text-primary-700">
                Inicial <strong className="text-primary">{dinero(precio.inicial, moneda)}</strong> + {precio.cuotas} cuotas {plural} de{' '}
                <strong className="text-primary">{dinero(precio.cuota, moneda)}</strong>
                <span className="block text-xs text-primary-500">Total referencial: {dinero(precio.total, moneda)}</span>
            </p>
        );
    }

    const cuotas = servicio.cuotas_max
        ? servicio.cuotas_min && servicio.cuotas_min !== servicio.cuotas_max
            ? `de ${servicio.cuotas_min} a ${servicio.cuotas_max} cuotas ${plural}`
            : `${servicio.cuotas_max} cuotas ${plural}`
        : null;

    return (
        <p className="text-sm text-primary-700">
            {servicio.inicial_porcentaje ? `${servicio.inicial_porcentaje} % de inicial` : 'Financiado'}
            {cuotas && ` y ${cuotas}`}. Precio según tu presupuesto.
        </p>
    );
}

function ServicioFila({ servicio }) {
    const [sinImagen, setSinImagen] = useState(!servicio.imagen_url);

    return (
        <li className="flex gap-4 rounded-2xl bg-primary-50 p-4">
            {!sinImagen && (
                <img
                    src={servicio.imagen_url}
                    alt=""
                    loading="lazy"
                    onError={() => setSinImagen(true)}
                    className="size-16 shrink-0 rounded-xl bg-white object-cover ring-1 ring-primary-100"
                />
            )}
            <div className="min-w-0 flex-1">
                <p className="font-bold text-primary">
                    {servicio.nombre}
                    {servicio.vehiculo && <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-semibold capitalize">{servicio.vehiculo}</span>}
                </p>
                <div className="mt-1">
                    <PrecioServicio servicio={servicio} />
                </div>
                {servicio.descripcion && (
                    <details className="group mt-2">
                        <summary className="cursor-pointer list-none text-xs font-semibold text-primary-500 hover:text-primary [&::-webkit-details-marker]:hidden">
                            <span className="group-open:hidden">Ver detalle</span>
                            <span className="hidden group-open:inline">Ocultar detalle</span>
                        </summary>
                        <p className="mt-2 text-sm whitespace-pre-line text-primary-700/80">{servicio.descripcion}</p>
                    </details>
                )}
            </div>
        </li>
    );
}

function TallerModal({ taller, onClose }) {
    const sitio = useSitio();
    const asesor = taller && sitio.whatsappUrl(`Hola, quiero financiar un servicio en ${taller.nombre}`);

    return (
        <Modal
            open={Boolean(taller)}
            onClose={onClose}
            maxWidth="max-w-3xl"
            header={
                taller && (
                    <div className="flex items-center gap-4 bg-primary px-5 py-5 pr-14 text-white sm:px-6">
                        <LogoAliado nombre={taller.nombre} logoUrl={taller.logo_url} className="size-14 text-base" />
                        <div className="min-w-0">
                            <h2 className="text-lg leading-snug font-bold sm:text-xl">{taller.nombre}</h2>
                            <div className="mt-1">
                                <Calificacion taller={taller} claro />
                            </div>
                        </div>
                    </div>
                )
            }
        >
            {taller && (
                <div className="flex flex-col gap-6">
                    {taller.descripcion && <p className="whitespace-pre-line text-primary-700/80">{taller.descripcion}</p>}
                    {taller.nota && (
                        <p className="rounded-xl bg-accent/30 px-4 py-3 text-sm font-medium whitespace-pre-line text-primary">{taller.nota}</p>
                    )}

                    <section>
                        <h3 className="mb-3 text-sm font-bold tracking-wider text-primary-500 uppercase">Servicios financiados</h3>
                        {taller.servicios.length > 0 ? (
                            <ul className="flex flex-col gap-3">
                                {taller.servicios.map((servicio) => (
                                    <ServicioFila key={servicio.id} servicio={servicio} />
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-primary-500">Consulta con tu asesor los servicios disponibles.</p>
                        )}
                    </section>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {taller.ubicaciones.length > 0 && (
                            <section>
                                <h3 className="mb-3 text-sm font-bold tracking-wider text-primary-500 uppercase">
                                    {taller.ubicaciones.length === 1 ? 'Dirección' : 'Sedes'}
                                </h3>
                                <ul className="flex flex-col gap-3">
                                    {taller.ubicaciones.map((ubicacion, i) => (
                                        <li key={i} className="text-sm">
                                            <p className="font-semibold text-primary">{ubicacion.direccion}</p>
                                            {lugar(ubicacion) && <p className="text-primary-500">{lugar(ubicacion)}</p>}
                                            {ubicacion.mapa_url && (
                                                <a
                                                    href={ubicacion.mapa_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-1 inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-2"
                                                >
                                                    <Navigation className="size-3.5" aria-hidden="true" /> Cómo llegar
                                                </a>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {taller.horario && (
                            <section>
                                <h3 className="mb-3 text-sm font-bold tracking-wider text-primary-500 uppercase">Horario</h3>
                                <dl className="text-sm">
                                    {DIAS_SEMANA.filter(([clave]) => taller.horario[clave]).map(([clave, etiqueta]) => {
                                        const dia = taller.horario[clave];
                                        return (
                                            <div key={clave} className="flex justify-between gap-4 border-b border-primary-100 py-1.5 last:border-0">
                                                <dt className="text-primary-500">{etiqueta}</dt>
                                                <dd className="font-semibold text-primary">{dia.cerrado ? 'Cerrado' : `${dia.apertura} – ${dia.cierre}`}</dd>
                                            </div>
                                        );
                                    })}
                                </dl>
                            </section>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 rounded-2xl bg-primary p-5 text-white sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm">
                            <strong className="block text-base">¿Quieres financiar un servicio?</strong>
                            Solicítalo desde la app CrediGO o con tu asesor.
                        </p>
                        <div className="flex shrink-0 flex-wrap gap-2">
                            {asesor && (
                                <Button href={asesor} newTab variant="outline-accent" size="sm" icon={MessageCircle}>
                                    Hablar con un asesor
                                </Button>
                            )}
                            {taller.whatsapp_url && (
                                <Button href={taller.whatsapp_url} newTab variant="primary" size="sm" icon={FaWhatsapp}>
                                    WhatsApp del taller
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}

/** Talleres aliados: la lista viene del ERP (con copia en caché); los textos se editan en el panel. */
export default function Talleres({ secciones, talleres, documentos }) {
    const hero = secciones['talleres.hero'];
    const [ciudad, setCiudad] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [seleccionado, setSeleccionado] = useState(null);

    const ciudades = useMemo(() => [...new Set(talleres.flatMap((t) => t.ciudades))].sort(), [talleres]);

    const visibles = useMemo(() => {
        const texto = normalizar(busqueda.trim());
        return talleres.filter(
            (t) =>
                (!ciudad || t.ciudades.includes(ciudad)) &&
                (!texto || normalizar(t.nombre).includes(texto) || t.servicios.some((s) => normalizar(s.nombre).includes(texto))),
        );
    }, [talleres, ciudad, busqueda]);

    const limpiar = () => {
        setCiudad('');
        setBusqueda('');
    };

    return (
        <PublicLayout title="Talleres aliados" description={hero?.contenido}>
            <PageHero
                imagen={hero?.imagen_url}
                title={hero?.titulo || 'Talleres aliados'}
                description={hero?.contenido}
            />

            <Section background="muted">
                {talleres.length === 0 ? (
                    <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-primary-100 sm:p-10">
                        <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary text-accent">
                            <Wrench className="size-7" aria-hidden="true" />
                        </span>
                        <h2 className="text-2xl font-extrabold text-primary">Muy pronto</h2>
                        <p className="mt-2 text-primary-700/80">Estamos publicando nuestra red de talleres aliados. Escríbenos para conocer los disponibles.</p>
                        <Button href="/soporte" variant="secondary" className="mt-6">
                            Ir a soporte
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="relative w-full lg:max-w-md">
                                <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-primary-400" aria-hidden="true" />
                                <Input
                                    type="search"
                                    aria-label="Buscar taller o servicio"
                                    placeholder="Busca un taller o servicio (ej. llantas)"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="pl-11"
                                />
                            </div>
                            {ciudades.length > 1 && (
                                <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por ciudad">
                                    {['', ...ciudades].map((opcion) => (
                                        <button
                                            key={opcion || 'todas'}
                                            type="button"
                                            onClick={() => setCiudad(opcion)}
                                            aria-pressed={ciudad === opcion}
                                            className={cn(
                                                'rounded-full px-4 py-2 text-sm font-semibold transition',
                                                ciudad === opcion ? 'bg-primary text-white' : 'bg-white text-primary ring-1 ring-primary-100 hover:ring-primary-300',
                                            )}
                                        >
                                            {opcion || 'Todas'}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <p className="mb-5 text-sm font-medium text-primary-500" aria-live="polite">
                            {visibles.length} {visibles.length === 1 ? 'taller' : 'talleres'}
                            {ciudad && ` en ${ciudad}`}
                        </p>

                        {visibles.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {visibles.map((taller, i) => (
                                    <Revelar key={taller.id} retraso={escalonar(i, 100)} className="h-full">
                                        <TallerCard taller={taller} onVer={setSeleccionado} />
                                    </Revelar>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-primary-100">
                                <p className="font-semibold text-primary">No encontramos talleres con ese filtro.</p>
                                <button
                                    type="button"
                                    onClick={limpiar}
                                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary underline underline-offset-2"
                                >
                                    <X className="size-4" aria-hidden="true" /> Quitar filtros
                                </button>
                            </div>
                        )}
                    </>
                )}
            </Section>

            <PasosSection seccion={secciones['talleres.como']} background="white">
                <DocumentosBloque documentos={documentos} />
            </PasosSection>
            {!secciones['talleres.como'] && <DocumentosSection documentos={documentos} />}
            <CtaSection seccion={secciones['general.cta']} />

            <TallerModal taller={seleccionado} onClose={() => setSeleccionado(null)} />
        </PublicLayout>
    );
}
