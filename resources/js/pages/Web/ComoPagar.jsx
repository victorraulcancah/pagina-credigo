import { BadgePercent, Check, Copy, Landmark, Mail, Phone, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import PaginaApi from '@/components/web/PaginaApi';
import Button from '@/components/ui/Button';
import Icono from '@/components/ui/Icono';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import CtaSection from '@/components/web/CtaSection';
import { DocumentosBloque, DocumentosSection } from '@/components/web/Documentos';
import FilasIcono from '@/components/web/FilasIcono';
import Recorrido from '@/components/web/Recorrido';
import TituloSeccion from '@/components/web/TituloSeccion';
import Video from '@/components/web/Video';
import { useSitio } from '@/hooks/useSitio';
import { copiarTexto } from '@/lib/copiar';
import { cn } from '@/lib/utils';

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

/** Página pública "Cómo pagar" (todo editable en Admin → Secciones → Cómo pagar, y sus guías en Documentos). */
function ComoPagarContenido({ secciones, documentos }) {
    const sitio = useSitio();
    const hero = secciones['pagos.hero'];
    const medios = secciones['pagos.medios'];
    const cuentas = secciones['pagos.cuentas'];
    const aviso = secciones['pagos.aviso'];
    const descuento = secciones['pagos.descuento'];
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
            <PageHero imagen={hero?.imagen_url} title={hero?.titulo || 'Cómo pagar'} description={hero?.contenido} />

            {/* Medios de pago: título a la izquierda; video, medios y guías en PDF a la derecha */}
            {medios ? (
                <Section>
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
                        <Revelar className="lg:sticky lg:top-24 lg:self-start">
                            <TituloSeccion titulo={medios.titulo} contenido={medios.contenido} />
                        </Revelar>
                        <div>
                            {medios.video_url && (
                                <Revelar desde="zoom" className="mb-10">
                                    <Video url={medios.video_url} titulo={medios.titulo} />
                                </Revelar>
                            )}
                            <FilasIcono items={medios.items} fallback="Wallet" />
                            <DocumentosBloque documentos={documentos} titulo="Guías para descargar" className="mt-12" />
                        </div>
                    </div>
                </Section>
            ) : (
                <DocumentosSection documentos={documentos} titulo="Guías para descargar" />
            )}

            {/* Sin cuentas cargadas en el panel no se muestra el bloque */}
            {cuentas && listaCuentas.length > 0 && (
                <Section id="cuentas" background="muted">
                    <Revelar>
                        <TituloSeccion titulo={cuentas.titulo} contenido={cuentas.contenido} />
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
                    <div className={cn('grid items-start gap-10', canales.length > 0 && 'lg:grid-cols-2 lg:gap-16')}>
                        <Revelar desde="izquierda">
                            <TituloSeccion titulo={aviso.titulo} contenido={aviso.contenido} claro>
                                <p className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm">
                                    <Landmark className="size-4 text-accent" aria-hidden="true" />
                                    <span>
                                        Titular: <strong>{titular}</strong>
                                        {sitio.empresa_ruc && ` · RUC ${sitio.empresa_ruc}`}
                                    </span>
                                </p>
                            </TituloSeccion>
                        </Revelar>

                        {canales.length > 0 && (
                            <Revelar desde="derecha" retraso={150}>
                                <h3 className="flex items-center gap-2 text-xl font-bold">
                                    <ShieldAlert className="size-5 text-accent" aria-hidden="true" /> Nuestros canales oficiales
                                </h3>
                                <p className="mt-1 text-white/70">Si te escriben desde otro número o cuenta, no es CrediGo.</p>
                                <ul className="mt-5 divide-y divide-white/15 border-y border-white/15">
                                    {canales.map((canal) => (
                                        <li key={canal.href}>
                                            <a
                                                href={canal.href}
                                                {...(canal.externo && { target: '_blank', rel: 'noopener noreferrer' })}
                                                className="flex items-center gap-3 py-4 font-semibold transition hover:text-accent"
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

            <Recorrido seccion={secciones['pagos.despues']} background="white" />

            {/* El descuento por viajes: el amarillo marca el beneficio */}
            {descuento && (
                <Section background="muted">
                    <Revelar className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-10">
                        <span className="flex size-16 items-center justify-center rounded-2xl bg-accent text-primary">
                            <BadgePercent className="size-8" aria-hidden="true" />
                        </span>
                        <TituloSeccion titulo={descuento.titulo} contenido={descuento.contenido} />
                        {descuento.boton_texto && descuento.boton_url && (
                            <Button href={descuento.boton_url} variant="secondary" size="lg" className="justify-self-start">
                                {descuento.boton_texto}
                            </Button>
                        )}
                    </Revelar>
                </Section>
            )}

            <CtaSection seccion={secciones['general.cta']} whatsappPrimero />
        </PublicLayout>
    );
}

/** Cómo pagar: el contenido llega de la API (GET /api/paginas/como-pagar). */
export default function ComoPagar() {
    return <PaginaApi url="/paginas/como-pagar">{(datos) => <ComoPagarContenido {...datos} />}</PaginaApi>;
}
