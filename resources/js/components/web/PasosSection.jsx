import Icono from '@/components/ui/Icono';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import { cn, columnasLg } from '@/lib/utils';

/** Lista numerada de pasos (sección con items: titulo, descripcion, icono). */
export default function PasosSection({ seccion, background = 'muted' }) {
    if (!seccion) return null;
    const pasos = seccion.items ?? [];

    return (
        <Section background={background}>
            <SectionHeading eyebrow={seccion.subtitulo} title={seccion.titulo} description={seccion.contenido} />
            {pasos.length > 0 && (
                <ol className={cn('mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2', columnasLg(pasos.length))}>
                    {pasos.map((paso, i) => (
                        <li key={i} className="relative rounded-2xl bg-white p-6 pt-8 shadow-sm ring-1 ring-primary-100 sm:p-8 sm:pt-10">
                            <span className="absolute -top-3.5 left-6 rounded-full bg-primary px-3 py-1 text-xs font-bold text-accent sm:left-8">
                                Paso {i + 1}
                            </span>
                            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-accent text-primary">
                                <Icono nombre={paso.icono} className="size-6" />
                            </div>
                            <h3 className="text-lg font-bold text-primary">{paso.titulo}</h3>
                            {paso.descripcion && <p className="mt-2 text-sm text-primary-700/80 sm:text-base">{paso.descripcion}</p>}
                        </li>
                    ))}
                </ol>
            )}
        </Section>
    );
}
