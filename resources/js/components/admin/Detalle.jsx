import { Mail, Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { whatsappDe } from '@/components/admin/solicitudes/estados';
import { cn } from '@/lib/utils';

/**
 * Piezas de las ventanas de detalle del panel (solicitudes, reclamaciones):
 * tarjetas blancas sobre fondo gris, datos de contacto con ícono y botones para contactar.
 */
export function Tarjeta({ titulo, acciones, children, className }) {
    return (
        <section className={cn('rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-5', className)}>
            {(titulo || acciones) && (
                <div className="mb-3 flex items-center justify-between gap-3">
                    {titulo && <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase">{titulo}</h3>}
                    {acciones}
                </div>
            )}
            {children}
        </section>
    );
}

export function DatoContacto({ icono: Icono, etiqueta, children }) {
    return (
        <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
                <Icono className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className="text-xs text-gray-500">{etiqueta}</p>
                <p className="font-semibold break-all text-gray-900">{children}</p>
            </div>
        </div>
    );
}

/** WhatsApp, llamar y correo en una fila (sin correo, el botón queda desactivado). */
export function AccionesContacto({ telefono, email, className }) {
    return (
        <div className={cn('grid grid-cols-3 gap-2', className)}>
            <a
                href={whatsappDe(telefono)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
            >
                <FaWhatsapp className="size-4" aria-hidden="true" /> WhatsApp
            </a>
            <a
                href={`tel:${telefono.replace(/\s/g, '')}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800"
            >
                <Phone className="size-4" aria-hidden="true" /> Llamar
            </a>
            <a
                href={email ? `mailto:${email}` : undefined}
                aria-disabled={!email}
                className={cn(
                    'flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ring-1 transition',
                    email ? 'bg-white text-primary ring-primary-200 hover:bg-primary-50' : 'pointer-events-none bg-gray-100 text-gray-400 ring-gray-200',
                )}
            >
                <Mail className="size-4" aria-hidden="true" /> Correo
            </a>
        </div>
    );
}
