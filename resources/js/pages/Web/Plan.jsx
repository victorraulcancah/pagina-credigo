import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Calculator, Check } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Icono from '@/components/ui/Icono';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import CtaSection from '@/components/web/CtaSection';
import Documentos from '@/components/web/Documentos';
import TextoFormateado from '@/components/web/TextoFormateado';
import Video from '@/components/web/Video';
import { useSitio } from '@/hooks/useSitio';
import { cuotaMasBaja, FRECUENCIAS, formatoMoneda } from '@/lib/moneda';
import { cn } from '@/lib/utils';

const Titulo = ({ className, children }) => (
    <h2 className={cn('text-3xl leading-[1.08] font-bold tracking-[-0.03em] text-balance sm:text-4xl', className)}>{children}</h2>
);

/** Encabezado del plan: qué es, desde cuánto y qué hacer; a la derecha su video o su imagen. */
function Encabezado({ servicio, menor, whatsapp }) {
    const cotizable = servicio.opciones.length > 0;
    const media = servicio.video_url ? (
        <Video url={servicio.video_url} titulo={servicio.titulo} />
    ) : servicio.imagen_url ? (
        <img src={servicio.imagen_url} alt="" fetchPriority="high" className="aspect-[4/3] w-full rounded-2xl object-cover" />
    ) : null;

    return (
        <section className="bg-primary text-white">
            <Container className="py-10 sm:py-14 lg:py-16">
                <Link href="/servicios" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 transition hover:text-white">
                    <ArrowLeft className="size-4" aria-hidden="true" /> Todos los planes
                </Link>

                <div className={cn('mt-8 grid items-center gap-10 lg:gap-16', media && 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]')}>
                    <div className="max-w-3xl">
                        <span className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
                            <Icono nombre={servicio.icono} className="size-7" />
                        </span>
                        <h1 className="flex flex-wrap items-center gap-x-4 gap-y-3 text-4xl leading-[1.04] font-bold tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl">
                            {servicio.titulo}
                            {servicio.etiqueta && (
                                <span className="rounded-full bg-accent px-3 py-1 text-sm font-bold tracking-normal text-primary">{servicio.etiqueta}</span>
                            )}
                        </h1>
                        {servicio.descripcion && <p className="mt-5 max-w-2xl text-lg whitespace-pre-line text-white/75 sm:text-xl">{servicio.descripcion}</p>}

                        {menor && (
                            <p className="mt-8 leading-tight">
                                <span className="block text-xs font-semibold tracking-wide text-white/60 uppercase">Cuota desde</span>
                                <span className="text-4xl font-bold tracking-[-0.02em] tabular-nums sm:text-5xl">{formatoMoneda(menor.cuota, menor.moneda)}</span>
                                <span className="ml-2 text-white/70">{FRECUENCIAS[menor.frecuencia]?.periodo}</span>
                            </p>
                        )}

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            {cotizable && (
                                <Button href={`/cotizador?plan=${servicio.id}`} size="lg" icon={Calculator}>
                                    Cotizar este plan
                                </Button>
                            )}
                            {whatsapp ? (
                                <Button href={whatsapp} newTab variant={cotizable ? 'outline-light' : 'primary'} size="lg" icon={FaWhatsapp}>
                                    Hablar con un asesor
                                </Button>
                            ) : (
                                <Button href="/soporte" variant={cotizable ? 'outline-light' : 'primary'} size="lg" icon={ArrowRight} iconPosition="right">
                                    Escríbenos
                                </Button>
                            )}
                        </div>
                    </div>

                    {media && (
                        <Revelar desde="derecha" retraso={150}>
                            {media}
                        </Revelar>
                    )}
                </div>
            </Container>
        </section>
    );
}

/** Una opción del cotizador como fila: nombre a la izquierda, montos en columnas. */
function FilaOpcion({ opcion }) {
    const frecuencia = FRECUENCIAS[opcion.frecuencia] ?? FRECUENCIAS.semanal;
    const datos = [
        ['Inicial', formatoMoneda(opcion.inicial, opcion.moneda)],
        ['Cuota', formatoMoneda(opcion.cuota, opcion.moneda), frecuencia.periodo],
        ['Cuotas', opcion.numero_cuotas ? `${opcion.numero_cuotas}` : null, frecuencia.plural],
    ];

    return (
        <li className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8">
            <div className="min-w-0">
                <p className="font-bold">{opcion.nombre}</p>
                {opcion.nota && <p className="mt-0.5 text-sm text-primary-700/80">{opcion.nota}</p>}
            </div>
            <dl className="grid grid-cols-3 gap-4 sm:w-[22rem] sm:text-right">
                {datos.map(([etiqueta, valor, detalle]) => (
                    <div key={etiqueta}>
                        <dt className="text-xs font-semibold tracking-wide text-primary-500 uppercase">{etiqueta}</dt>
                        <dd className="mt-0.5 text-lg font-bold tabular-nums">{valor ?? '—'}</dd>
                        {valor && detalle && <dd className="text-xs text-primary-500">{detalle}</dd>}
                    </div>
                ))}
            </dl>
        </li>
    );
}

/** Qué incluye el plan y sus opciones con montos (del panel → Cotizador). */
function IncluyeYOpciones({ servicio, whatsapp }) {
    const caracteristicas = servicio.caracteristicas ?? [];
    const opciones = servicio.opciones;
    if (!caracteristicas.length && !opciones.length) return null;

    return (
        <Section>
            <div className={cn('grid gap-14 lg:gap-16', caracteristicas.length && 'lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]')}>
                {caracteristicas.length > 0 && (
                    <Revelar desde="izquierda">
                        <Titulo>Qué incluye</Titulo>
                        <ul className="mt-8 flex flex-col gap-4">
                            {caracteristicas.map((caracteristica, i) => (
                                <li key={i} className="flex items-start gap-3 text-lg">
                                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                                        <Check className="size-4" aria-hidden="true" />
                                    </span>
                                    {caracteristica}
                                </li>
                            ))}
                        </ul>
                    </Revelar>
                )}

                <Revelar desde={caracteristicas.length ? 'derecha' : 'abajo'} retraso={caracteristicas.length ? 120 : 0}>
                    <Titulo>Opciones y cuotas</Titulo>
                    {opciones.length > 0 ? (
                        <>
                            <ul className="mt-8 divide-y divide-primary-100 border-y border-primary-100">
                                {opciones.map((opcion) => (
                                    <FilaOpcion key={opcion.id} opcion={opcion} />
                                ))}
                            </ul>
                            <p className="mt-4 text-sm text-primary-500">Montos referenciales. Las condiciones finales se definen en el contrato, luego de la evaluación.</p>
                            <Button href={`/cotizador?plan=${servicio.id}`} variant="secondary" icon={Calculator} className="mt-6">
                                Cotizar este plan
                            </Button>
                        </>
                    ) : (
                        <>
                            <p className="mt-6 max-w-xl text-lg text-primary-700/80">Consulta los montos de este plan con un asesor.</p>
                            <Button href={whatsapp ?? '/soporte'} newTab={Boolean(whatsapp)} variant="secondary" icon={FaWhatsapp} className="mt-6">
                                Consultar montos
                            </Button>
                        </>
                    )}
                </Revelar>
            </div>
        </Section>
    );
}

/** Texto largo del plan (panel → Servicios → Detalle): cómo funciona, adjudicación, condiciones. */
function Detalle({ texto }) {
    if (!texto) return null;

    return (
        <Section background="muted">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
                <Revelar>
                    <Titulo className="lg:sticky lg:top-24">Cómo funciona este plan</Titulo>
                </Revelar>
                <Revelar retraso={120}>
                    <TextoFormateado texto={texto} subtitulo="h3" className="max-w-[68ch]" />
                </Revelar>
            </div>
        </Section>
    );
}

/** Lo que se pide para inscribirse (sección de Requisitos) y la ficha del plan en PDF. */
function ParaInscribirte({ requisitos, documentos, background }) {
    const lista = requisitos?.items ?? [];
    if (!lista.length && !documentos.length) return null;

    return (
        <Section background={background}>
            {/* Con un solo bloque, a lo ancho de lectura (no de toda la página) */}
            <div className={cn('grid gap-14 lg:gap-16', lista.length && documentos.length ? 'lg:grid-cols-2' : 'max-w-3xl')}>
                {lista.length > 0 && (
                    <Revelar desde="izquierda">
                        <Titulo>Lo que necesitas para inscribirte</Titulo>
                        <ul className="mt-8 divide-y divide-primary-100 border-y border-primary-100">
                            {lista.map((item, i) => (
                                <li key={i} className="flex items-start gap-4 py-4">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-accent">
                                        <Icono nombre={item.icono} fallback="FileText" className="size-5" />
                                    </span>
                                    <span className="min-w-0 pt-0.5">
                                        <span className="block font-bold">{item.titulo}</span>
                                        {item.descripcion && <span className="mt-0.5 block text-sm text-primary-700/80">{item.descripcion}</span>}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <Button href="/requisitos" variant="outline" icon={ArrowRight} iconPosition="right" className="mt-6">
                            Ver todos los requisitos
                        </Button>
                    </Revelar>
                )}
                {documentos.length > 0 && (
                    <Revelar desde={lista.length ? 'derecha' : 'abajo'} retraso={lista.length ? 120 : 0}>
                        <Titulo>Descarga la ficha del plan</Titulo>
                        <Documentos documentos={documentos} className="mt-8" />
                    </Revelar>
                )}
            </div>
        </Section>
    );
}

/** Los demás planes, para comparar sin volver atrás. */
function OtrosPlanes({ planes, background }) {
    if (!planes.length) return null;

    return (
        <Section background={background}>
            <Revelar>
                <Titulo>Otros planes</Titulo>
            </Revelar>
            <ul className="mt-8 grid border-t border-primary-100 sm:grid-cols-2 sm:gap-x-10">
                {planes.map((plan, i) => (
                    <Revelar as="li" key={plan.id} retraso={escalonar(i, 80)} className="border-b border-primary-100">
                        <Link href={`/servicios/${plan.slug}`} className="group flex items-center gap-4 py-5">
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-accent">
                                <Icono nombre={plan.icono} className="size-6" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block font-bold group-hover:underline">{plan.titulo}</span>
                                {plan.descripcion && <span className="mt-0.5 line-clamp-1 block text-sm text-primary-700/80">{plan.descripcion}</span>}
                            </span>
                            <ArrowRight className="size-5 shrink-0 text-primary-400 transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
                        </Link>
                    </Revelar>
                ))}
            </ul>
        </Section>
    );
}

/** Página de un plan (/servicios/{slug}). Todo viene del panel: Servicios, Cotizador, Documentos y Requisitos. */
export default function Plan({ secciones, servicio, documentos, otros }) {
    const sitio = useSitio();
    const whatsapp = sitio.whatsappUrl(`Hola, quiero información sobre el plan "${servicio.titulo}"`);
    const menor = cuotaMasBaja(servicio.opciones);
    // Fondos alternados: si no hay detalle, los bloques siguientes cambian de color
    const [fondoInscribirte, fondoOtros] = servicio.detalle ? ['white', 'muted'] : ['muted', 'white'];

    return (
        <PublicLayout title={servicio.titulo} description={servicio.descripcion}>
            <Encabezado servicio={servicio} menor={menor} whatsapp={whatsapp} />
            <IncluyeYOpciones servicio={servicio} whatsapp={whatsapp} />
            <Detalle texto={servicio.detalle} />
            <ParaInscribirte requisitos={secciones['requisitos.documentos']} documentos={documentos} background={fondoInscribirte} />
            <OtrosPlanes planes={otros} background={fondoOtros} />
            <CtaSection seccion={secciones['general.cta']} whatsappPrimero />
        </PublicLayout>
    );
}
