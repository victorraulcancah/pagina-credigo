import { ArrowRight, MessageCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Revelar from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import CtaSection from '@/components/web/CtaSection';
import { DocumentosBloque, DocumentosSection } from '@/components/web/Documentos';
import FilasIcono from '@/components/web/FilasIcono';
import Recorrido from '@/components/web/Recorrido';
import TituloSeccion from '@/components/web/TituloSeccion';
import { useSitio } from '@/hooks/useSitio';

/** Título a la izquierda (fijo al bajar en computadora) y la lista a la derecha. */
function Dividido({ izquierda, children }) {
    return (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
            <Revelar className="lg:sticky lg:top-24 lg:self-start">{izquierda}</Revelar>
            <div>{children}</div>
        </div>
    );
}

/** Página pública de requisitos para inscribirse (todo editable en Admin → Secciones → Requisitos y Documentos). */
export default function Requisitos({ secciones, documentos: pdfs }) {
    const sitio = useSitio();
    const hero = secciones['requisitos.hero'];
    const documentos = secciones['requisitos.documentos'];
    const datos = secciones['requisitos.datos'];
    const empresas = secciones['requisitos.empresas'];
    const whatsapp = sitio.whatsappUrl('Hola, tengo una consulta sobre los requisitos para inscribirme');

    return (
        <PublicLayout title="Requisitos" description={hero?.contenido}>
            <PageHero imagen={hero?.imagen_url} title={hero?.titulo || 'Requisitos'} description={hero?.contenido} />

            {/* Documentos que se piden y, debajo, la lista en PDF para descargar */}
            {documentos ? (
                <Section>
                    <Dividido izquierda={<TituloSeccion titulo={documentos.titulo} contenido={documentos.contenido} />}>
                        <FilasIcono items={documentos.items} fallback="FileText" />
                        <DocumentosBloque documentos={pdfs} titulo="Descarga los requisitos" className="mt-12" />
                    </Dividido>
                </Section>
            ) : (
                <DocumentosSection documentos={pdfs} titulo="Descarga los requisitos" />
            )}

            {datos && (
                <Section background="muted">
                    <Dividido
                        izquierda={
                            <TituloSeccion titulo={datos.titulo} contenido={datos.contenido}>
                                <div className="mt-8 max-w-md rounded-2xl bg-primary p-6 text-white">
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
                            </TituloSeccion>
                        }
                    >
                        <FilasIcono items={datos.items} fallback="ClipboardCheck" />
                    </Dividido>
                </Section>
            )}

            <Recorrido seccion={secciones['requisitos.proceso']} background="white" />

            {empresas && (
                <Section background="dark">
                    <Dividido izquierda={<TituloSeccion titulo={empresas.titulo} contenido={empresas.contenido} claro />}>
                        <FilasIcono items={empresas.items} fallback="FileText" claro />
                    </Dividido>
                </Section>
            )}

            <CtaSection seccion={secciones['general.cta']} whatsappPrimero />
        </PublicLayout>
    );
}
