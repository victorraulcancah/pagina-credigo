import Icono from '@/components/ui/Icono';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import { cn, columnasLg } from '@/lib/utils';

// Colores de medalla según el orden del nivel (1.º bronce, 2.º plata, 3.º oro)
const MEDALLAS = [
    { fondo: 'bg-[#cd7f32]', texto: 'text-white' },
    { fondo: 'bg-[#b8bcc6]', texto: 'text-primary' },
    { fondo: 'bg-[#e0b62c]', texto: 'text-primary' },
];

/** Niveles de fidelización (sección general.beneficios: items titulo, descripcion, icono). */
export default function NivelesSection({ seccion, background = 'white' }) {
    const niveles = seccion?.items ?? [];
    if (!niveles.length) return null;

    return (
        <Section id="beneficios" background={background}>
            <SectionHeading eyebrow={seccion.subtitulo} title={seccion.titulo} description={seccion.contenido} />
            <div className={cn('mt-12 grid gap-6 sm:grid-cols-2', columnasLg(niveles.length))}>
                {niveles.map((nivel, i) => {
                    const medalla = MEDALLAS[i] ?? { fondo: 'bg-accent', texto: 'text-primary' };
                    const esUltimo = i === niveles.length - 1;

                    return (
                        <article
                            key={i}
                            className={cn(
                                'relative flex h-full flex-col overflow-hidden rounded-2xl p-6 shadow-sm ring-1 sm:p-8',
                                esUltimo ? 'bg-primary text-white ring-primary' : 'bg-white text-primary ring-primary-100',
                            )}
                        >
                            <span className={cn('mb-5 flex size-14 items-center justify-center rounded-full shadow-inner', medalla.fondo, medalla.texto)}>
                                <Icono nombre={nivel.icono} fallback="Medal" className="size-7" />
                            </span>
                            <p className={cn('text-xs font-bold tracking-wider uppercase', esUltimo ? 'text-accent' : 'text-primary-400')}>
                                Nivel {i + 1}
                            </p>
                            <h3 className="mt-1 text-2xl font-extrabold">{nivel.titulo}</h3>
                            {nivel.descripcion && (
                                <p className={cn('mt-3 text-sm sm:text-base', esUltimo ? 'text-primary-100' : 'text-primary-700/80')}>
                                    {nivel.descripcion}
                                </p>
                            )}
                        </article>
                    );
                })}
            </div>
        </Section>
    );
}
