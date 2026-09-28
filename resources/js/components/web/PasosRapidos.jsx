import Container from '@/components/ui/Container';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import { cn, columnasLg } from '@/lib/utils';

/** Franja amarilla con los pasos resumidos, justo debajo del banner (sección inicio.pasos_rapidos). */
export default function PasosRapidos({ seccion }) {
    const pasos = seccion?.items ?? [];
    if (!pasos.length) return null;

    return (
        <section aria-label="Pasos" className="bg-accent text-primary">
            <Container>
                <ol className={cn('grid grid-cols-2 gap-x-4 gap-y-6 py-8 sm:gap-x-8', columnasLg(pasos.length))}>
                    {pasos.map((paso, i) => (
                        <Revelar as="li" key={i} retraso={escalonar(i, 100)} className="flex items-start gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-accent">
                                {i + 1}
                            </span>
                            <div className="min-w-0">
                                <p className="leading-tight font-bold">{paso.titulo}</p>
                                {paso.descripcion && <p className="mt-0.5 text-sm text-primary-800">{paso.descripcion}</p>}
                            </div>
                        </Revelar>
                    ))}
                </ol>
            </Container>
        </section>
    );
}
