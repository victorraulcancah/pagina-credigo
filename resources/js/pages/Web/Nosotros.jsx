import { Eye, Target } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import Card from '@/components/ui/Card';
import FeatureCard from '@/components/ui/FeatureCard';
import Icono from '@/components/ui/Icono';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import CifrasSection from '@/components/web/CifrasSection';
import CtaSection from '@/components/web/CtaSection';
import TextoConImagen from '@/components/web/TextoConImagen';
import { cn, columnasLg } from '@/lib/utils';

function MisionVisionCard({ seccion, icon: Icon }) {
    if (!seccion) return null;

    return (
        <Card className="h-full">
            <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary text-accent">
                <Icon className="size-7" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold text-primary">{seccion.titulo}</h3>
            <p className="mt-3 text-base whitespace-pre-line text-primary-700/80 sm:text-lg">{seccion.contenido}</p>
        </Card>
    );
}

export default function Nosotros({ secciones }) {
    const hero = secciones['nosotros.hero'];
    const mision = secciones['nosotros.mision'];
    const vision = secciones['nosotros.vision'];
    const valores = secciones['nosotros.valores'];
    const listaValores = valores?.items ?? [];

    return (
        <PublicLayout title="Nosotros" description={hero?.contenido}>
            <PageHero eyebrow={hero?.subtitulo} title={hero?.titulo || 'Nosotros'} description={hero?.contenido} />

            <TextoConImagen seccion={secciones['nosotros.historia']} />

            {(mision || vision) && (
                <Section background="muted">
                    <div className={cn('grid gap-6', mision && vision && 'md:grid-cols-2')}>
                        <MisionVisionCard seccion={mision} icon={Target} />
                        <MisionVisionCard seccion={vision} icon={Eye} />
                    </div>
                </Section>
            )}

            {valores && (
                <Section>
                    <SectionHeading eyebrow={valores.subtitulo} title={valores.titulo} description={valores.contenido} />
                    {listaValores.length > 0 && (
                        <div className={cn('mt-12 grid gap-6 sm:grid-cols-2', columnasLg(listaValores.length))}>
                            {listaValores.map((valor, i) => (
                                <FeatureCard
                                    key={i}
                                    icon={(props) => <Icono nombre={valor.icono} {...props} />}
                                    title={valor.titulo}
                                    description={valor.descripcion}
                                />
                            ))}
                        </div>
                    )}
                </Section>
            )}

            <CifrasSection seccion={secciones['general.cifras']} />
            <CtaSection seccion={secciones['general.cta']} />
        </PublicLayout>
    );
}
