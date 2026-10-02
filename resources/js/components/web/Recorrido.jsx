import { ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import TituloSeccion from '@/components/web/TituloSeccion';
import Video from '@/components/web/Video';
import { cn, columnasLg } from '@/lib/utils';

/**
 * Pasos de una sección (items: titulo, descripcion) como un recorrido: estaciones numeradas
 * sobre una misma línea (horizontal en computadora, vertical en celular). Con video cargado
 * en el panel, va entre el título y los pasos. `children`: contenido extra al pie (ej. documentos).
 */
export default function Recorrido({ id, seccion, background = 'muted', children }) {
    const pasos = seccion?.items ?? [];
    if (!seccion || !pasos.length) return null;
    // El aro de cada número tapa la línea con el color del fondo
    const aro = background === 'white' ? 'ring-white' : 'ring-primary-50';

    return (
        <Section id={id} background={background}>
            <Revelar>
                <TituloSeccion titulo={seccion.titulo} contenido={seccion.contenido} />
            </Revelar>

            {seccion.video_url && (
                <Revelar desde="zoom" className="mt-12 max-w-4xl">
                    <Video url={seccion.video_url} titulo={seccion.titulo} />
                </Revelar>
            )}

            <ol className={cn('relative mt-14 grid gap-10 lg:gap-8', columnasLg(pasos.length))}>
                <span aria-hidden="true" className="absolute top-6 right-0 left-6 hidden h-px bg-primary-200 lg:block" />
                <span aria-hidden="true" className="absolute top-6 bottom-6 left-6 w-px bg-primary-200 lg:hidden" />
                {pasos.map((paso, i) => (
                    <Revelar as="li" key={i} desde="izquierda" retraso={escalonar(i, 120)} className="relative flex gap-5 lg:flex-col lg:gap-6">
                        <span
                            className={cn(
                                'relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-accent ring-8 tabular-nums',
                                aro,
                            )}
                        >
                            {i + 1}
                        </span>
                        <div>
                            <h3 className="text-lg font-bold">{paso.titulo}</h3>
                            {paso.descripcion && <p className="mt-2 text-primary-700/80">{paso.descripcion}</p>}
                        </div>
                    </Revelar>
                ))}
            </ol>

            {seccion.boton_texto && seccion.boton_url && (
                <div className="mt-12">
                    <Button href={seccion.boton_url} variant="outline" icon={ArrowRight} iconPosition="right">
                        {seccion.boton_texto}
                    </Button>
                </div>
            )}
            {children}
        </Section>
    );
}
