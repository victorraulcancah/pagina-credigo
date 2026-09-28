import { ArrowRight } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import CtaSection from '@/components/web/CtaSection';
import FaqSection from '@/components/web/FaqSection';
import HeroBanner from '@/components/web/HeroBanner';
import NivelesSection from '@/components/web/NivelesSection';
import PasosRapidos from '@/components/web/PasosRapidos';
import PasosSection from '@/components/web/PasosSection';
import ServicioCard from '@/components/web/ServicioCard';
import TextoConImagen from '@/components/web/TextoConImagen';
import { cn, columnasLg } from '@/lib/utils';

export default function Inicio({ banners, secciones, servicios, preguntas }) {
    const encabezadoPlanes = secciones['inicio.servicios'];

    return (
        <PublicLayout>
            <HeroBanner banners={banners} cifras={secciones['general.cifras']?.items ?? []} />
            <PasosRapidos seccion={secciones['inicio.pasos_rapidos']} />

            {servicios.length > 0 && (
                <Section id="planes">
                    <Revelar>
                        <SectionHeading
                            eyebrow={encabezadoPlanes?.subtitulo}
                            title={encabezadoPlanes?.titulo}
                            description={encabezadoPlanes?.contenido}
                        />
                    </Revelar>
                    <div className={cn('mt-12 grid gap-6 sm:grid-cols-2', columnasLg(servicios.length))}>
                        {servicios.map((servicio, i) => (
                            <Revelar key={servicio.id} retraso={escalonar(i)} className="h-full">
                                <ServicioCard servicio={servicio} />
                            </Revelar>
                        ))}
                    </div>
                    {encabezadoPlanes?.boton_texto && encabezadoPlanes?.boton_url && (
                        <div className="mt-10 text-center">
                            <Button href={encabezadoPlanes.boton_url} variant="outline" icon={ArrowRight} iconPosition="right">
                                {encabezadoPlanes.boton_texto}
                            </Button>
                        </div>
                    )}
                </Section>
            )}

            <PasosSection id="como-funciona" seccion={secciones['inicio.como_funciona']} />
            <NivelesSection seccion={secciones['general.beneficios']} />
            <TextoConImagen seccion={secciones['inicio.nosotros']} background="muted" />
            <FaqSection seccion={secciones['general.faq']} preguntas={preguntas} />
            <CtaSection seccion={secciones['general.cta']} />
        </PublicLayout>
    );
}
