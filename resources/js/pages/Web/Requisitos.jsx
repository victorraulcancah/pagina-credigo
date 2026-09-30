import { ArrowRight, Building2, MessageCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Icono from '@/components/ui/Icono';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import CtaSection from '@/components/web/CtaSection';
import PasosSection from '@/components/web/PasosSection';
import { useSitio } from '@/hooks/useSitio';
import { cn, columnasLg } from '@/lib/utils';

/** Documento requerido: tarjeta con ícono y número de orden. */
function DocumentoCard({ item, numero }) {
    return (
        <article className="group relative flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 sm:p-7">
            <span aria-hidden="true" className="absolute top-5 right-6 text-4xl font-extrabold text-primary-100 transition group-hover:text-accent">
                {String(numero).padStart(2, '0')}
            </span>
            <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary text-accent">
                <Icono nombre={item.icono} fallback="FileText" className="size-7" />
            </span>
            <h3 className="pr-10 text-lg font-bold text-primary">{item.titulo}</h3>
            {item.descripcion && <p className="mt-2 text-sm text-primary-700/80 sm:text-base">{item.descripcion}</p>}
        </article>
    );
}

/** Página pública de requisitos para inscribirse (todo editable en Admin → Secciones → Requisitos). */
export default function Requisitos({ secciones }) {
    const sitio = useSitio();
    const hero = secciones['requisitos.hero'];
    const documentos = secciones['requisitos.documentos'];
    const datos = secciones['requisitos.datos'];
    const empresas = secciones['requisitos.empresas'];
    const listaDocumentos = documentos?.items ?? [];
    const whatsapp = sitio.whatsappUrl('Hola, tengo una consulta sobre los requisitos para inscribirme');

    return (
        <PublicLayout title="Requisitos" description={hero?.contenido}>
            <PageHero imagen={hero?.imagen_url} eyebrow={hero?.subtitulo} title={hero?.titulo || 'Requisitos'} description={hero?.contenido} />

            {documentos && (
                <Section>
                    <Revelar>
                        <SectionHeading eyebrow={documentos.subtitulo} title={documentos.titulo} description={documentos.contenido} />
                    </Revelar>
                    {listaDocumentos.length > 0 && (
                        <div className={cn('mt-12 grid gap-6 sm:grid-cols-2', columnasLg(listaDocumentos.length))}>
                            {listaDocumentos.map((item, i) => (
                                <Revelar key={i} retraso={escalonar(i)} className="h-full">
                                    <DocumentoCard item={item} numero={i + 1} />
                                </Revelar>
                            ))}
                        </div>
                    )}
                </Section>
            )}

            {datos && (
                <Section background="muted">
                    <div className="grid items-start gap-10 lg:grid-cols-5 lg:gap-14">
                        <Revelar desde="izquierda" className="lg:sticky lg:top-24 lg:col-span-2">
                            <SectionHeading align="left" eyebrow={datos.subtitulo} title={datos.titulo} description={datos.contenido} />
                            <div className="mt-8 rounded-2xl bg-primary p-6 text-white">
                                <p className="flex items-center gap-2 font-bold">
                                    <MessageCircle className="size-5 text-accent" aria-hidden="true" /> ¿Te falta algún documento?
                                </p>
                                <p className="mt-2 text-sm text-white/75">Escríbenos y un asesor te dice cómo continuar con tu inscripción.</p>
                                {whatsapp ? (
                                    <Button href={whatsapp} newTab variant="outline-accent" icon={FaWhatsapp} className="mt-5">
                                        Consultar por WhatsApp
                                    </Button>
                                ) : (
                                    <Button href="/soporte" variant="outline-accent" icon={ArrowRight} iconPosition="right" className="mt-5">
                                        Escríbenos
                                    </Button>
                                )}
                            </div>
                        </Revelar>

                        <ul className="flex flex-col gap-4 lg:col-span-3">
                            {(datos.items ?? []).map((item, i) => (
                                <Revelar
                                    as="li"
                                    key={i}
                                    desde="derecha"
                                    retraso={escalonar(i, 100)}
                                    className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-primary-100 sm:p-6"
                                >
                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                                        <Icono nombre={item.icono} fallback="ClipboardCheck" className="size-6" />
                                    </span>
                                    <div className="min-w-0 pt-0.5">
                                        <h3 className="text-base font-bold text-primary sm:text-lg">{item.titulo}</h3>
                                        {item.descripcion && <p className="mt-1 text-sm text-primary-700/80 sm:text-base">{item.descripcion}</p>}
                                    </div>
                                </Revelar>
                            ))}
                        </ul>
                    </div>
                </Section>
            )}

            <PasosSection seccion={secciones['requisitos.proceso']} background="white" />

            {empresas && (
                <Section background="dark">
                    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                        <Revelar desde="izquierda">
                            <span className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
                                <Building2 className="size-7" aria-hidden="true" />
                            </span>
                            <SectionHeading light align="left" eyebrow={empresas.subtitulo} title={empresas.titulo} description={empresas.contenido} />
                        </Revelar>

                        <ul className="flex flex-col gap-4">
                            {(empresas.items ?? []).map((item, i) => (
                                <Revelar
                                    as="li"
                                    key={i}
                                    desde="derecha"
                                    retraso={escalonar(i, 120)}
                                    className="flex items-start gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 sm:p-6"
                                >
                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                                        <Icono nombre={item.icono} fallback="FileText" className="size-6" />
                                    </span>
                                    <div className="min-w-0 pt-0.5">
                                        <h3 className="text-base font-bold text-white sm:text-lg">{item.titulo}</h3>
                                        {item.descripcion && <p className="mt-1 text-sm text-white/70 sm:text-base">{item.descripcion}</p>}
                                    </div>
                                </Revelar>
                            ))}
                        </ul>
                    </div>
                </Section>
            )}

            <CtaSection seccion={secciones['general.cta']} />
        </PublicLayout>
    );
}
