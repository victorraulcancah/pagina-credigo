import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import Section from '@/components/ui/Section';
import { DocumentosBloque } from '@/components/web/Documentos';
import TextoFormateado from '@/components/web/TextoFormateado';
import { formatoFecha } from '@/lib/fechas';

/** Términos y condiciones / Política de privacidad (texto editable en el panel). */
export default function Legal({ seccion, documentos }) {
    return (
        <PublicLayout title={seccion.titulo}>
            <PageHero title={seccion.titulo} description={`Última actualización: ${formatoFecha(seccion.updated_at, false)}`} />
            <Section>
                <div className="mx-auto max-w-3xl">
                    <TextoFormateado texto={seccion.contenido} />
                    <DocumentosBloque documentos={documentos} titulo="Documentos legales" />
                </div>
            </Section>
        </PublicLayout>
    );
}
