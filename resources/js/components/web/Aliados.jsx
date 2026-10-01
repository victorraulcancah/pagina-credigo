import { Clock, MapPin, Navigation } from 'lucide-react';
import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { estadoHorario } from '@/lib/horario';
import { cn, iniciales } from '@/lib/utils';

/** "San Borja, Lima" a partir de una sede del ERP. */
export const lugar = (ubicacion) => [ubicacion?.distrito, ubicacion?.departamento].filter(Boolean).join(', ');

/** Logo de un aliado del ERP (taller o comercio); si no tiene o no carga, sus iniciales. */
export function LogoAliado({ nombre, logoUrl, className }) {
    const [fallo, setFallo] = useState(false);

    if (!logoUrl || fallo) {
        return (
            <span aria-hidden="true" className={cn('flex shrink-0 items-center justify-center rounded-2xl bg-primary font-extrabold text-accent', className)}>
                {iniciales(nombre)}
            </span>
        );
    }

    return (
        <img
            src={logoUrl}
            alt=""
            loading="lazy"
            onError={() => setFallo(true)}
            className={cn('shrink-0 rounded-2xl bg-white object-contain p-1.5 ring-1 ring-primary-100', className)}
        />
    );
}

/** Dirección principal y "Abierto ahora" del aliado. */
export function DatosAliado({ aliado, children }) {
    const estado = estadoHorario(aliado.horario);
    const principal = aliado.ubicaciones[0];

    return (
        <ul className="flex flex-col gap-2 text-sm text-primary-700/80">
            {lugar(principal) && (
                <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary-400" aria-hidden="true" />
                    {lugar(principal)}
                    {aliado.ubicaciones.length > 1 && ` · ${aliado.ubicaciones.length} sedes`}
                </li>
            )}
            {estado && (
                <li className={cn('flex items-center gap-2 font-medium', estado.abierto ? 'text-green-700' : 'text-primary-500')}>
                    <Clock className="size-4 shrink-0" aria-hidden="true" /> {estado.texto}
                </li>
            )}
            {children}
        </ul>
    );
}

/** Botones redondos de WhatsApp y "Cómo llegar". */
export function ContactoAliado({ aliado }) {
    const mapa = aliado.ubicaciones[0]?.mapa_url;

    return (
        <>
            {aliado.whatsapp_url && (
                <a
                    href={aliado.whatsapp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`WhatsApp de ${aliado.nombre}`}
                    title="WhatsApp"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:brightness-95"
                >
                    <FaWhatsapp className="size-5" aria-hidden="true" />
                </a>
            )}
            {mapa && (
                <a
                    href={mapa}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Cómo llegar a ${aliado.nombre}`}
                    title="Cómo llegar"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary transition hover:bg-accent"
                >
                    <Navigation className="size-5" aria-hidden="true" />
                </a>
            )}
        </>
    );
}
