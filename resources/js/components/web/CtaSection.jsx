import { ArrowRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import Button from '@/components/ui/Button';
import Revelar from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import { useSitio } from '@/hooks/useSitio';

/**
 * Llamada a la acción en franja amarilla (sección general.cta).
 * `whatsappPrimero`: WhatsApp como botón lleno (acción principal) y el botón de la sección con contorno.
 */
export default function CtaSection({ seccion, whatsappPrimero = false }) {
    const whatsapp = useSitio().whatsappUrl();
    if (!seccion) return null;

    return (
        <Section background="accent" className="py-14 sm:py-16 lg:py-20">
            <Revelar className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
                <div className="max-w-2xl">
                    <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{seccion.titulo}</h2>
                    {seccion.contenido && <p className="mt-3 text-base text-primary-800 sm:text-lg">{seccion.contenido}</p>}
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    {seccion.boton_texto && seccion.boton_url && (
                        <Button
                            href={seccion.boton_url}
                            variant={whatsappPrimero && whatsapp ? 'outline' : 'secondary'}
                            size="lg"
                            icon={ArrowRight}
                            iconPosition="right"
                            className={whatsappPrimero && whatsapp ? 'order-2' : undefined}
                        >
                            {seccion.boton_texto}
                        </Button>
                    )}
                    {whatsapp && (
                        <Button href={whatsapp} newTab variant={whatsappPrimero ? 'secondary' : 'outline'} size="lg" icon={FaWhatsapp}>
                            WhatsApp
                        </Button>
                    )}
                </div>
            </Revelar>
        </Section>
    );
}
