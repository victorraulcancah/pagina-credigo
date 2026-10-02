import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import PaginaApi from '@/components/web/PaginaApi';
import Section from '@/components/ui/Section';
import CtaSection from '@/components/web/CtaSection';
import { DocumentosSection } from '@/components/web/Documentos';
import ListaPlanes from '@/components/web/ListaPlanes';

/**
 * Todos los planes visibles como lista (cada uno lleva a su página, donde están su ficha y su video).
 * Debajo, las fichas en PDF que no son de un plan en particular.
 */
function ServiciosContenido({ secciones, servicios, documentos }) {
    const hero = secciones['servicios.hero'];

    return (
        <PublicLayout title="Servicios" description={hero?.contenido}>
            <PageHero imagen={hero?.imagen_url} title={hero?.titulo || 'Servicios'} description={hero?.contenido} />

            <Section>
                {servicios.length > 0 ? (
                    <ListaPlanes servicios={servicios} className="divide-y divide-primary-100 border-b border-primary-100" />
                ) : (
                    <p className="text-lg text-primary-700/80">Pronto publicaremos nuestros servicios.</p>
                )}
            </Section>

            <DocumentosSection documentos={documentos} titulo="Fichas y documentos" background="muted" />

            <CtaSection seccion={secciones['general.cta']} whatsappPrimero />
        </PublicLayout>
    );
}

/** Servicios: el contenido llega de la API (GET /api/paginas/servicios). */
export default function Servicios() {
    return <PaginaApi url="/paginas/servicios">{(datos) => <ServiciosContenido {...datos} />}</PaginaApi>;
}
