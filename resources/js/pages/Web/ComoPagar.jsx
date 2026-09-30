import { BadgePercent, Check, Copy, Landmark, Mail, Phone, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import FeatureCard from '@/components/ui/FeatureCard';
import Icono from '@/components/ui/Icono';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import CtaSection from '@/components/web/CtaSection';
import PasosSection from '@/components/web/PasosSection';
import { useSitio } from '@/hooks/useSitio';
import { copiarTexto } from '@/lib/copiar';
import { cn, columnasLg } from '@/lib/utils';

// Con 5 o más medios, 3 columnas se ven más ordenadas que 4
const columnasMedios = (cantidad) => (cantidad >= 5 ? 'lg:grid-cols-3' : columnasLg(cantidad));

/** Número copiable: "Cuenta: 193-..." muestra la etiqueta y copia solo el número. */
function DatoCopiable({ linea }) {
    const [copiado, setCopiado] = useState(false);
    const separador = linea.indexOf(':');
    const etiqueta = separador > 0 ? linea.slice(0, separador).trim() : null;
    const valor = separador > 0 ? linea.slice(separador + 1).trim() : linea.trim();

    const copiar = async () => {
        if (await copiarTexto(valor)) {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        }
    };

    return (
        <button
            type="button"
            onClick={copiar}
            title="Copiar"
            className="group flex w-full items-center justify-between gap-3 rounded-xl bg-primary-50 px-4 py-3 text-left transition hover:bg-accent"
        >
            <span className="min-w-0">
                {etiqueta && <span className="block text-xs font-semibold tracking-wide text-primary-500 uppercase group-hover:text-primary">{etiqueta}</span>}
                <span className="block font-mono text-base font-bold break-all text-primary sm:text-lg">{valor}</span>
            </span>
            <span className={cn('flex shrink-0 items-center gap-1 text-xs font-semibold', copiado ? 'text-green-700' : 'text-primary-500 group-hover:text-primary')}>
                {copiado ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                <span aria-live="polite">{copiado ? 'Copiado' : 'Copiar'}</span>
            </span>
        </button>
    );
}

/** Cuenta oficial: título (banco y tipo) y una línea por dato ("Cuenta: …", "CCI: …"). */
function CuentaCard({ cuenta, titular }) {
    const lineas = (cuenta.descripcion ?? '').split('\n').filter((linea) => linea.trim());

    return (
        <article className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary-100 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-accent">
                    <Icono nombre={cuenta.icono} fallback="Landmark" className="size-6" />
                </span>
                <div className="min-w-0">
                    <h3 className="text-lg font-bold text-primary">{cuenta.titulo}</h3>
                    {titular && <p className="text-sm text-primary-500">A nombre de {titular}</p>}
                </div>
            </div>
            <div className="mt-auto flex flex-col gap-2">
                {lineas.map((linea, i) => (
                    <DatoCopiable key={i} linea={linea} />
                ))}
            </div>
        </article>
    );
}

/** Página pública "Cómo pagar" (todo editable en Admin → Secciones → Cómo pagar). */
export default function ComoPagar({ secciones }) {
    const sitio = useSitio();
    const hero = secciones['pagos.hero'];
    const medios = secciones['pagos.medios'];
    const cuentas = secciones['pagos.cuentas'];
    const aviso = secciones['pagos.aviso'];
    const descuento = secciones['pagos.descuento'];
    const listaMedios = medios?.items ?? [];
    const listaCuentas = cuentas?.items ?? [];
    const titular = sitio.empresa_razon_social || sitio.empresa_nombre;
    const whatsapp = sitio.whatsappUrl('Hola, quiero confirmar un pago');

    const canales = [
        sitio.contacto_telefono && { icon: Phone, texto: sitio.contacto_telefono, href: `tel:${sitio.contacto_telefono.replace(/\s+/g, '')}` },
        whatsapp && { icon: FaWhatsapp, texto: 'WhatsApp oficial', href: whatsapp, externo: true },
        sitio.contacto_email && { icon: Mail, texto: sitio.contacto_email, href: `mailto:${sitio.contacto_email}` },
        ...sitio.redes.map((red) => ({ icon: red.icon, texto: red.label, href: red.href, externo: true })),
    ].filter(Boolean);

    return (
        <PublicLayout title="Cómo pagar" description={hero?.contenido}>
            <PageHero imagen={hero?.imagen_url} eyebrow={hero?.subtitulo} title={hero?.titulo || 'Cómo pagar'} description={hero?.contenido} />

            {medios && (
                <Section>
                    <Revelar>
                        <SectionHeading eyebrow={medios.subtitulo} title={medios.titulo} description={medios.contenido} />
                    </Revelar>
                    {listaMedios.length > 0 && (
                        <div className={cn('mt-12 grid gap-6 sm:grid-cols-2', columnasMedios(listaMedios.length))}>
                            {listaMedios.map((medio, i) => (
                                <Revelar key={i} retraso={escalonar(i)} className="h-full">
                                    <FeatureCard
                                        icon={(props) => <Icono nombre={medio.icono} fallback="Wallet" {...props} />}
                                        title={medio.titulo}
                                        description={medio.descripcion}
                                    />
                                </Revelar>
                            ))}
                        </div>
                    )}
                </Section>
            )}

            {/* Sin cuentas cargadas en el panel no se muestra el bloque */}
            {cuentas && listaCuentas.length > 0 && (
                <Section id="cuentas" background="muted">
                    <Revelar>
                        <SectionHeading eyebrow={cuentas.subtitulo} title={cuentas.titulo} description={cuentas.contenido} />
                    </Revelar>
                    <div className={cn('mt-12 grid gap-6 md:grid-cols-2', listaCuentas.length >= 3 && 'lg:grid-cols-3')}>
                        {listaCuentas.map((cuenta, i) => (
                            <Revelar key={i} desde="zoom" retraso={escalonar(i)} className="h-full">
                                <CuentaCard cuenta={cuenta} titular={titular} />
                            </Revelar>
                        ))}
                    </div>
                </Section>
            )}

            {aviso && (
                <Section background="dark">
                    <div className={cn('grid items-center gap-10', canales.length > 0 && 'lg:grid-cols-2 lg:gap-16')}>
                        <Revelar desde="izquierda">
                            <span className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
                                <ShieldAlert className="size-7" aria-hidden="true" />
                            </span>
                            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{aviso.titulo}</h2>
                            {aviso.contenido && <p className="mt-4 text-base whitespace-pre-line text-white/80 sm:text-lg">{aviso.contenido}</p>}
                            <p className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm">
                                <Landmark className="size-4 text-accent" aria-hidden="true" />
                                <span>
                                    Titular: <strong>{titular}</strong>
                                    {sitio.empresa_ruc && ` · RUC ${sitio.empresa_ruc}`}
                                </span>
                            </p>
                        </Revelar>

                        {canales.length > 0 && (
                            <Revelar desde="derecha" retraso={150} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 sm:p-8">
                                <p className="text-sm font-bold tracking-wider text-accent uppercase">Nuestros canales oficiales</p>
                                <p className="mt-1 text-sm text-white/70">Si te escriben desde otro número o cuenta, no es CrediGo.</p>
                                <ul className="mt-5 flex flex-col gap-2">
                                    {canales.map((canal) => (
                                        <li key={canal.href}>
                                            <a
                                                href={canal.href}
                                                {...(canal.externo && { target: '_blank', rel: 'noopener noreferrer' })}
                                                className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition hover:bg-white/10"
                                            >
                                                <canal.icon className="size-5 shrink-0 text-accent" aria-hidden="true" />
                                                <span className="min-w-0 break-all">{canal.texto}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </Revelar>
                        )}
                    </div>
                </Section>
            )}

            <PasosSection seccion={secciones['pagos.despues']} background="white" />

            {descuento && (
                <Section background="muted">
                    <Revelar
                        desde="zoom"
                        className="flex flex-col items-start gap-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-primary-100 sm:p-10 lg:flex-row lg:items-center"
                    >
                        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
                            <BadgePercent className="size-8" aria-hidden="true" />
                        </span>
                        <div className="flex-1">
                            {descuento.subtitulo && <p className="text-xs font-bold tracking-wider text-primary-500 uppercase">{descuento.subtitulo}</p>}
                            <h2 className="mt-1 text-2xl font-extrabold text-primary sm:text-3xl">{descuento.titulo}</h2>
                            {descuento.contenido && <p className="mt-3 text-base text-primary-700/80 sm:text-lg">{descuento.contenido}</p>}
                        </div>
                        {descuento.boton_texto && descuento.boton_url && (
                            <Button href={descuento.boton_url} variant="secondary" className="shrink-0">
                                {descuento.boton_texto}
                            </Button>
                        )}
                    </Revelar>
                </Section>
            )}

            <CtaSection seccion={secciones['general.cta']} />
        </PublicLayout>
    );
}
