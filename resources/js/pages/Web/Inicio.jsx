import { ArrowRight, Calculator, Check, MessageCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Icono from '@/components/ui/Icono';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import CtaSection from '@/components/web/CtaSection';
import FaqSection from '@/components/web/FaqSection';
import Semana from '@/components/web/inicio/Semana';
import { useSitio } from '@/hooks/useSitio';
import { FRECUENCIAS, formatoMoneda } from '@/lib/moneda';
import { cn } from '@/lib/utils';

// Cuota más baja con monto cargado (prefiere soles); `soloSemanal` para la franja de la semana
function cuotaMasBaja(opciones, soloSemanal = false) {
    const conCuota = opciones.filter((o) => o.cuota !== null && o.cuota !== undefined && (!soloSemanal || o.frecuencia === 'semanal'));
    if (!conCuota.length) return null;
    const soles = conCuota.filter((o) => o.moneda === 'PEN');
    const lista = soles.length ? soles : conCuota;
    return lista.reduce((menor, o) => (Number(o.cuota) < Number(menor.cuota) ? o : menor));
}

const esWhatsapp = (url) => /wa\.me|whatsapp/i.test(url ?? '');

const Titulo = ({ as: Tag = 'h2', className, children }) => (
    <Tag className={cn('text-3xl leading-[1.08] font-bold tracking-[-0.03em] text-balance sm:text-4xl lg:text-5xl', className)}>{children}</Tag>
);

/** Cifras reales en una sola línea (no como tablero de métricas) + la etiqueta del banner. */
function LineaCifras({ cifras, etiqueta, className }) {
    if (!cifras.length && !etiqueta) return null;

    return (
        <p className={cn('flex flex-wrap items-baseline gap-x-6 gap-y-1.5 text-sm text-white/70 sm:text-base', className)}>
            {cifras.map((cifra, i) => (
                <span key={i}>
                    <strong className="font-bold text-white tabular-nums">{cifra.titulo}</strong> {cifra.descripcion}
                </span>
            ))}
            {etiqueta && <span className="font-semibold text-white/80">{etiqueta}</span>}
        </p>
    );
}

/** Primer pantallazo: titular del primer banner + la semana del conductor + línea de cifras. */
function Portada({ banner, semana, cuota, cifras }) {
    const sitio = useSitio();
    const whatsapp = sitio.whatsappUrl();
    const titulo = banner?.titulo || sitio.empresa_eslogan || sitio.empresa_nombre;
    const subtitulo = banner?.subtitulo || sitio.empresa_descripcion;
    const principal = banner?.boton_texto && banner?.boton_url ? { texto: banner.boton_texto, url: banner.boton_url } : whatsapp && { texto: 'Escríbenos por WhatsApp', url: whatsapp };
    const secundario = banner?.boton2_texto && banner?.boton2_url ? { texto: banner.boton2_texto, url: banner.boton2_url } : { texto: 'Cotiza tu plan', url: '/cotizador' };

    return (
        <section className="relative overflow-clip bg-primary text-white">
            <Container className="relative py-10 sm:py-12 lg:pt-12 lg:pb-14">
                <h1 className="max-w-5xl text-[2.6rem] leading-[1.02] font-bold tracking-[-0.035em] text-balance sm:text-6xl lg:text-[4.5rem] xl:text-[4.75rem]">{titulo}</h1>
                {subtitulo && <p className="mt-5 max-w-2xl text-lg text-pretty text-white/75 sm:text-xl">{subtitulo}</p>}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    {principal && (
                        <Button
                            href={principal.url}
                            newTab={esWhatsapp(principal.url)}
                            size="lg"
                            icon={esWhatsapp(principal.url) ? FaWhatsapp : ArrowRight}
                            iconPosition={esWhatsapp(principal.url) ? 'left' : 'right'}
                        >
                            {principal.texto}
                        </Button>
                    )}
                    <Button href={secundario.url} variant="outline-light" size="lg">
                        {secundario.texto}
                    </Button>
                </div>

                {/* Celular: la prueba va antes de la semana para que entre en la primera pantalla */}
                <LineaCifras cifras={cifras} etiqueta={banner?.etiqueta} className="mt-6 md:hidden" />

                <div className="mt-8">
                    <Semana seccion={semana} cuota={cuota} />
                </div>

                <LineaCifras cifras={cifras} etiqueta={banner?.etiqueta} className="mt-6 hidden border-t border-white/15 pt-5 md:flex" />
            </Container>
        </section>
    );
}

/** Los demás banners del panel, como una fila de novedades después de los planes. */
function Novedades({ banners }) {
    if (!banners.length) return null;

    return (
        <section aria-label="Novedades" className="border-t border-white/10 bg-primary-950 text-white">
            <Container className="flex flex-col divide-y divide-white/10 sm:flex-row sm:divide-x sm:divide-y-0">
                {banners.map((banner) => {
                    const contenido = (
                        <>
                            <span className="min-w-0">
                                <span className="block font-bold">{banner.titulo}</span>
                                {banner.subtitulo && <span className="mt-0.5 block text-sm text-white/65">{banner.subtitulo}</span>}
                            </span>
                            {banner.boton_url && <ArrowRight className="size-5 shrink-0 text-accent transition group-hover:translate-x-1" aria-hidden="true" />}
                        </>
                    );
                    const clase = 'group flex flex-1 items-center justify-between gap-4 py-5 sm:px-6 sm:first:pl-0 sm:last:pr-0';

                    if (banner.solo_imagen && banner.imagen_url) {
                        return (
                            <a key={banner.id} href={banner.boton_url || undefined} className={clase}>
                                <img src={banner.imagen_url} alt={banner.titulo || 'Novedad'} className="h-16 w-auto rounded-lg object-cover" />
                            </a>
                        );
                    }

                    return banner.boton_url ? (
                        <a key={banner.id} href={banner.boton_url} className={clase}>
                            {contenido}
                        </a>
                    ) : (
                        <div key={banner.id} className={clase}>
                            {contenido}
                        </div>
                    );
                })}
            </Container>
        </section>
    );
}

/** Planes como lista: cada fila dice qué es, qué incluye, desde cuánto y qué hacer. */
function Planes({ encabezado, servicios }) {
    const sitio = useSitio();
    if (!servicios.length) return null;

    return (
        <Section id="planes">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <Revelar>
                    <Titulo className="max-w-3xl">{encabezado?.titulo || 'Nuestros planes'}</Titulo>
                    {encabezado?.contenido && <p className="mt-4 max-w-2xl text-lg text-primary-700/80">{encabezado.contenido}</p>}
                </Revelar>
                {encabezado?.boton_texto && encabezado?.boton_url && (
                    <Button href={encabezado.boton_url} variant="outline" icon={ArrowRight} iconPosition="right" className="self-start lg:self-end">
                        {encabezado.boton_texto}
                    </Button>
                )}
            </div>

            <ul className="mt-12 divide-y divide-primary-100 border-y border-primary-100">
                {servicios.map((servicio, i) => {
                    const menor = cuotaMasBaja(servicio.opciones ?? []);
                    const asesor = sitio.whatsappUrl(`Hola, quiero información sobre el plan "${servicio.titulo}"`);
                    const caracteristicas = (servicio.caracteristicas ?? []).slice(0, 3);

                    return (
                        <Revelar
                            as="li"
                            key={servicio.id}
                            retraso={escalonar(i, 80)}
                            className="grid gap-5 py-8 transition-colors lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_13rem] lg:items-center lg:gap-10"
                        >
                            <div className="flex gap-4">
                                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-accent">
                                    <Icono nombre={servicio.icono} className="size-6" />
                                </span>
                                <div className="min-w-0">
                                    <h3 className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xl leading-snug font-bold sm:text-2xl">
                                        {servicio.titulo}
                                        {servicio.etiqueta && (
                                            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-primary">{servicio.etiqueta}</span>
                                        )}
                                    </h3>
                                    {servicio.descripcion && <p className="mt-1.5 text-primary-700/80">{servicio.descripcion}</p>}
                                </div>
                            </div>

                            {caracteristicas.length > 0 ? (
                                <ul className="flex flex-col gap-2 text-sm text-primary-800 lg:pl-0">
                                    {caracteristicas.map((caracteristica, k) => (
                                        <li key={k} className="flex items-start gap-2">
                                            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                                            {caracteristica}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <span className="hidden lg:block" />
                            )}

                            <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end lg:text-right">
                                {menor ? (
                                    <p className="leading-tight">
                                        <span className="block text-xs font-semibold tracking-wide text-primary-500 uppercase">Cuota desde</span>
                                        <span className="text-2xl font-bold tabular-nums">{formatoMoneda(menor.cuota, menor.moneda)}</span>
                                        <span className="ml-1 text-sm text-primary-500">{FRECUENCIAS[menor.frecuencia]?.periodo}</span>
                                    </p>
                                ) : (
                                    <span className="hidden lg:block" />
                                )}
                                {servicio.opciones_count > 0 ? (
                                    <Button href={`/cotizador?plan=${servicio.id}`} variant="secondary" size="sm" icon={Calculator}>
                                        Cotizar
                                    </Button>
                                ) : (
                                    <Button href={asesor ?? '/soporte'} newTab={Boolean(asesor)} variant="outline" size="sm" icon={MessageCircle}>
                                        Consultar
                                    </Button>
                                )}
                            </div>
                        </Revelar>
                    );
                })}
            </ul>
        </Section>
    );
}

/** Cómo funciona como un recorrido: estaciones numeradas sobre una misma línea. */
function Recorrido({ seccion }) {
    const pasos = seccion?.items ?? [];
    if (!seccion || !pasos.length) return null;

    return (
        <Section id="como-funciona" background="muted">
            <Revelar>
                <Titulo className="max-w-3xl">{seccion.titulo}</Titulo>
                {seccion.contenido && <p className="mt-4 max-w-2xl text-lg text-primary-700/80">{seccion.contenido}</p>}
            </Revelar>

            <ol className="relative mt-14 grid gap-10 lg:grid-cols-4 lg:gap-8">
                <span aria-hidden="true" className="absolute top-6 right-0 left-6 hidden h-px bg-primary-200 lg:block" />
                <span aria-hidden="true" className="absolute top-6 bottom-6 left-6 w-px bg-primary-200 lg:hidden" />
                {pasos.map((paso, i) => (
                    <Revelar as="li" key={i} desde="izquierda" retraso={escalonar(i, 120)} className="relative flex gap-5 lg:flex-col lg:gap-6">
                        <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-accent ring-8 ring-primary-50 tabular-nums">
                            {i + 1}
                        </span>
                        <div>
                            <h3 className="text-lg font-bold">{paso.titulo}</h3>
                            {paso.descripcion && <p className="mt-2 text-primary-700/80">{paso.descripcion}</p>}
                        </div>
                    </Revelar>
                ))}
            </ol>

            {seccion.boton_texto && seccion.boton_url && (
                <div className="mt-12">
                    <Button href={seccion.boton_url} variant="outline" icon={ArrowRight} iconPosition="right">
                        {seccion.boton_texto}
                    </Button>
                </div>
            )}
        </Section>
    );
}

// Escala de la marca para los niveles: azul claro, azul medio, y amarillo solo para el más alto
const MEDALLAS = ['bg-primary-100 text-primary', 'bg-primary-200 text-primary', 'bg-accent text-primary'];

/** Niveles como una sola barra de progreso dividida en tramos. */
function Niveles({ seccion }) {
    const niveles = seccion?.items ?? [];
    if (!niveles.length) return null;

    return (
        <Section>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <Revelar>
                    <Titulo className="max-w-3xl">{seccion.titulo}</Titulo>
                    {seccion.contenido && <p className="mt-4 max-w-2xl text-lg text-primary-700/80">{seccion.contenido}</p>}
                </Revelar>
                <Button href="/beneficios" variant="outline" icon={ArrowRight} iconPosition="right" className="self-start lg:self-end">
                    Ver beneficios
                </Button>
            </div>

            <Revelar desde="zoom" className="mt-12 overflow-hidden rounded-2xl ring-1 ring-primary-100">
                <div className="grid md:grid-cols-3">
                    {niveles.map((nivel, i) => {
                        const ultimo = i === niveles.length - 1;
                        return (
                            <div key={i} className={cn('flex flex-col p-6 sm:p-8', ultimo ? 'bg-primary text-white' : 'bg-white', i > 0 && 'border-t border-primary-100 md:border-t-0 md:border-l')}>
                                <span className={cn('mb-5 flex size-12 items-center justify-center rounded-full', MEDALLAS[i] ?? 'bg-accent text-primary')}>
                                    <Icono nombre={nivel.icono} fallback="Medal" className="size-6" />
                                </span>
                                <h3 className="text-2xl font-bold">{nivel.titulo}</h3>
                                {nivel.descripcion && <p className={cn('mt-2 text-sm sm:text-base', ultimo ? 'text-white/75' : 'text-primary-700/80')}>{nivel.descripcion}</p>}
                                {/* Tramo de la barra: se llena hasta este nivel */}
                                <span aria-hidden="true" className="mt-auto flex gap-1 pt-6">
                                    {niveles.map((_, k) => (
                                        <span key={k} className={cn('h-1.5 flex-1 rounded-full', k <= i ? (ultimo ? 'bg-accent' : 'bg-primary') : ultimo ? 'bg-white/20' : 'bg-primary-100')} />
                                    ))}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </Revelar>
        </Section>
    );
}

/** Resumen de Nosotros sobre el azul de marca. Con imagen del panel, a dos columnas; sin imagen, solo texto. */
function Nosotros({ seccion }) {
    if (!seccion) return null;
    const conImagen = Boolean(seccion.imagen_url);

    return (
        <Section background="dark">
            <div className={cn('grid items-center gap-10 lg:gap-16', conImagen && 'lg:grid-cols-2')}>
                <Revelar desde="izquierda" className={cn(!conImagen && 'max-w-3xl')}>
                    <Titulo className="text-white">{seccion.titulo}</Titulo>
                    {seccion.contenido && <p className="mt-5 max-w-xl text-lg text-white/75">{seccion.contenido}</p>}
                    {seccion.boton_texto && seccion.boton_url && (
                        <Button href={seccion.boton_url} variant="primary" icon={ArrowRight} iconPosition="right" className="mt-8">
                            {seccion.boton_texto}
                        </Button>
                    )}
                </Revelar>
                {conImagen && (
                    <Revelar desde="derecha" retraso={150}>
                        <img src={seccion.imagen_url} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />
                    </Revelar>
                )}
            </div>
        </Section>
    );
}

/** Inicio: la semana del conductor (ver .impeccable/surfaces). Todo el contenido viene del panel. */
export default function Inicio({ banners, secciones, servicios, preguntas }) {
    const principal = banners.find((b) => b.titulo && !b.solo_imagen) ?? null;
    const otros = banners.filter((b) => b !== principal);
    const menorSemanal = cuotaMasBaja(servicios.flatMap((s) => s.opciones ?? []), true);
    const faq = secciones['general.faq'];

    return (
        <PublicLayout>
            <Portada
                banner={principal}
                semana={secciones['inicio.semana']}
                cuota={menorSemanal && formatoMoneda(menorSemanal.cuota, menorSemanal.moneda)}
                cifras={secciones['general.cifras']?.items ?? []}
            />
            <Planes encabezado={secciones['inicio.servicios']} servicios={servicios} />
            {/* Los demás banners, como promoción después de ver los planes */}
            <Novedades banners={otros} />
            <Recorrido seccion={secciones['inicio.como_funciona']} />
            <Niveles seccion={secciones['general.beneficios']} />
            <Nosotros seccion={secciones['inicio.nosotros']} />
            <FaqSection seccion={faq && { ...faq, subtitulo: null }} preguntas={preguntas} />
            <CtaSection seccion={secciones['general.cta']} whatsappPrimero />
        </PublicLayout>
    );
}
