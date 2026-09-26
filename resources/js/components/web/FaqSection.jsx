import { ChevronDown } from 'lucide-react';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';

/** Preguntas frecuentes en acordeón (details/summary: accesible sin JavaScript). */
export default function FaqSection({ seccion, preguntas = [], background = 'white' }) {
    if (!preguntas.length) return null;

    return (
        <Section id="preguntas" background={background}>
            <SectionHeading
                eyebrow={seccion?.subtitulo}
                title={seccion?.titulo || 'Preguntas frecuentes'}
                description={seccion?.contenido}
            />
            <div className="mx-auto mt-10 max-w-3xl divide-y divide-primary-100 rounded-2xl bg-white shadow-sm ring-1 ring-primary-100">
                {preguntas.map((item) => (
                    <details key={item.id} className="group p-5 sm:p-6">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-primary sm:text-lg [&::-webkit-details-marker]:hidden">
                            {item.pregunta}
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-50 transition group-open:rotate-180 group-open:bg-accent">
                                <ChevronDown className="size-5" aria-hidden="true" />
                            </span>
                        </summary>
                        <p className="mt-3 pr-10 text-sm whitespace-pre-line text-primary-700/80 sm:text-base">{item.respuesta}</p>
                    </details>
                ))}
            </div>
        </Section>
    );
}
