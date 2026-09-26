import { ArrowRight } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import CifrasSection from '@/components/web/CifrasSection';
import CtaSection from '@/components/web/CtaSection';
import FaqSection from '@/components/web/FaqSection';
import HeroBanner from '@/components/web/HeroBanner';
import PasosSection from '@/components/web/PasosSection';
import ServicioCard from '@/components/web/ServicioCard';
import TextoConImagen from '@/components/web/TextoConImagen';
import { cn, columnasLg } from '@/lib/utils';

export default function Inicio({ banners, secciones, servicios, preguntas }) {
    const encabezadoServicios = secciones['inicio.servicios'];

    return (
        <PublicLayout>
            <HeroBanner banners={banners} />

            {servicios.length > 0 && (
                <Section>
                    <SectionHeading
                        eyebrow={encabezadoServicios?.subtitulo}
                        title={encabezadoServicios?.titulo}
                        description={encabezadoServicios?.contenido}
                    />
                    <div className={cn('mt-12 grid gap-6 sm:grid-cols-2', columnasLg(servicios.length))}>
                        {servicios.map((servicio) => (
                            <ServicioCard key={servicio.id} servicio={servicio} />
                        ))}
                    </div>
                    {encabezadoServicios?.boton_texto && encabezadoServicios?.boton_url && (
                        <div className="mt-10 text-center">
                            <Button href={encabezadoServicios.boton_url} variant="outline" icon={ArrowRight} iconPosition="right">
                                {encabezadoServicios.boton_texto}
                            </Button>
                        </div>
                    )}
                </Section>
            )}

            <PasosSection seccion={secciones['inicio.como_funciona']} />
            <TextoConImagen seccion={secciones['inicio.nosotros']} />
            <CifrasSection seccion={secciones['general.cifras']} />
            <FaqSection seccion={secciones['general.faq']} preguntas={preguntas} background="muted" />
            <CtaSection seccion={secciones['general.cta']} />
        </PublicLayout>
    );
}
