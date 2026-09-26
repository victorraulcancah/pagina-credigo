import { ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import { useSitio } from '@/hooks/useSitio';
import { cn } from '@/lib/utils';

/**
 * Texto + imagen en dos columnas (historia, resumen de nosotros).
 * Sin imagen cargada muestra un panel con el logo.
 */
export default function TextoConImagen({ seccion, background = 'white', invertido = false }) {
    const sitio = useSitio();
    if (!seccion) return null;

    return (
        <Section background={background}>
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div className={cn(invertido && 'lg:order-2')}>
                    <SectionHeading align="left" eyebrow={seccion.subtitulo} title={seccion.titulo} />
                    {seccion.contenido && (
                        <p className="mt-5 text-base whitespace-pre-line text-primary-700/80 sm:text-lg">{seccion.contenido}</p>
                    )}
                    {seccion.boton_texto && seccion.boton_url && (
                        <Button href={seccion.boton_url} variant="secondary" icon={ArrowRight} iconPosition="right" className="mt-8">
                            {seccion.boton_texto}
                        </Button>
                    )}
                </div>

                {seccion.imagen_url ? (
                    <img
                        src={seccion.imagen_url}
                        alt={seccion.titulo ?? ''}
                        className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl"
                    />
                ) : (
                    <div className="relative flex aspect-[4/3] items-center justify-center overflow-clip rounded-3xl bg-primary p-10">
                        <div aria-hidden="true" className="absolute -top-16 -right-16 size-64 resplandor-acento" />
                        <img src={sitio.logo} alt="" className="relative w-1/2 max-w-xs object-contain drop-shadow-2xl" />
                    </div>
                )}
            </div>
        </Section>
    );
}
