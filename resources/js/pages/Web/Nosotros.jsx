import { Compass, Eye, Target } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import FeatureCard from '@/components/ui/FeatureCard';
import Icono from '@/components/ui/Icono';
import Revelar from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import CifrasSection from '@/components/web/CifrasSection';
import CtaSection from '@/components/web/CtaSection';
import TextoConImagen from '@/components/web/TextoConImagen';
import { cn, columnasLg } from '@/lib/utils';

/**
 * Misión, visión u objetivo en una fila: texto a un lado e imagen al otro,
 * alternando el lado en cada fila. Sin imagen se muestra un recuadro con el ícono.
 */
function PilarFila({ seccion, icon: Icon, invertida }) {
    return (
        <article className="grid items-center gap-8 py-10 first:pt-0 last:pb-0 md:grid-cols-2 md:gap-12 lg:gap-16 sm:py-12">
            {/* La imagen entra desde su lado: derecha si está a la derecha, izquierda si está a la izquierda */}
            <Revelar desde={invertida ? 'izquierda' : 'derecha'} className={cn('overflow-hidden rounded-2xl ring-1 ring-white/10', !invertida && 'md:order-last')}>
                {seccion.imagen_url ? (
                    <img src={seccion.imagen_url} alt={seccion.titulo} loading="lazy" className="aspect-video size-full object-cover" />
                ) : (
                    <div className="relative flex aspect-video items-center justify-center overflow-clip bg-white/5">
                        <div aria-hidden="true" className="absolute size-56 resplandor-acento opacity-40" />
                        <Icon className="relative size-20 text-accent sm:size-24" strokeWidth={1.25} aria-hidden="true" />
                    </div>
                )}
            </Revelar>

            <Revelar retraso={150}>
                <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="text-2xl font-extrabold tracking-wide text-white uppercase sm:text-3xl">{seccion.titulo}</h3>
                <p className="mt-4 text-base leading-relaxed whitespace-pre-line text-white/75 sm:text-lg">{seccion.contenido}</p>
            </Revelar>
        </article>
    );
}

export default function Nosotros({ secciones }) {
    const hero = secciones['nosotros.hero'];
    const pilares = [
        { seccion: secciones['nosotros.mision'], icon: Compass },
        { seccion: secciones['nosotros.vision'], icon: Eye },
        { seccion: secciones['nosotros.objetivo'], icon: Target },
    ].filter((pilar) => pilar.seccion);
    const valores = secciones['nosotros.valores'];
    const listaValores = valores?.items ?? [];

    return (
        <PublicLayout title="Nosotros" description={hero?.contenido}>
            <PageHero imagen={hero?.imagen_url} eyebrow={hero?.subtitulo} title={hero?.titulo || 'Nosotros'} description={hero?.contenido} />

            <TextoConImagen seccion={secciones['nosotros.historia']} />

            {pilares.length > 0 && (
                <Section background="dark">
                    <div className="mx-auto max-w-5xl divide-y divide-white/10">
                        {pilares.map(({ seccion, icon }, i) => (
                            <PilarFila key={seccion.clave} seccion={seccion} icon={icon} invertida={i % 2 === 1} />
                        ))}
                    </div>
                </Section>
            )}

            {valores && (
                <Section>
                    <Revelar>
                        <SectionHeading eyebrow={valores.subtitulo} title={valores.titulo} description={valores.contenido} />
                    </Revelar>
                    {listaValores.length > 0 && (
                        <div className={cn('mt-12 grid gap-6 sm:grid-cols-2', columnasLg(listaValores.length))}>
                            {listaValores.map((valor, i) => (
                                <Revelar key={i} retraso={i * 120} className="h-full">
                                    <FeatureCard
                                        icon={(props) => <Icono nombre={valor.icono} {...props} />}
                                        title={valor.titulo}
                                        description={valor.descripcion}
                                    />
                                </Revelar>
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
