import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import CtaSection from '@/components/web/CtaSection';
import ServicioCard from '@/components/web/ServicioCard';

export default function Servicios({ secciones, servicios }) {
    const hero = secciones['servicios.hero'];

    return (
        <PublicLayout title="Servicios" description={hero?.contenido}>
            <PageHero imagen={hero?.imagen_url} eyebrow={hero?.subtitulo} title={hero?.titulo || 'Servicios'} description={hero?.contenido} />

            <Section background="muted">
                {servicios.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {servicios.map((servicio, i) => (
                            <Revelar key={servicio.id} retraso={escalonar(i)} className="h-full">
                                <ServicioCard servicio={servicio} />
                            </Revelar>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-primary-700/80">Pronto publicaremos nuestros servicios.</p>
                )}
            </Section>

            <CtaSection seccion={secciones['general.cta']} />
        </PublicLayout>
    );
}
