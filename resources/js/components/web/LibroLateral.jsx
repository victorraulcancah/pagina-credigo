import { Clock, Headset, Mail, Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { useSitio } from '@/hooks/useSitio';
import { cn } from '@/lib/utils';

/** Tarjeta del panel lateral. `oscura` usa el color primario de fondo. */
export function TarjetaLateral({ icon: Icono, titulo, oscura = false, className, children }) {
    return (
        <section className={cn('rounded-2xl p-5 shadow-sm ring-1 sm:p-6', oscura ? 'bg-primary text-white ring-primary' : 'bg-white text-primary ring-primary-100', className)}>
            <h2 className="mb-4 flex items-center gap-3 text-base font-bold">
                <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', oscura ? 'bg-accent text-primary' : 'bg-primary-50 text-primary')}>
                    <Icono className="size-5" aria-hidden="true" />
                </span>
                {titulo}
            </h2>
            {children}
        </section>
    );
}

/** Fila etiqueta / valor dentro de una tarjeta lateral. */
export function DatoLateral({ etiqueta, children }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-primary-100 py-2.5 text-sm last:border-0">
            <dt className="text-primary-500">{etiqueta}</dt>
            <dd className="text-right font-semibold text-primary">{children}</dd>
        </div>
    );
}

/** "¿Necesitas ayuda?": canales de contacto configurados en el panel. */
export function AyudaLateral() {
    const sitio = useSitio();
    const whatsapp = sitio.whatsappUrl('Hola, necesito ayuda con el Libro de Reclamaciones');
    const canales = [
        sitio.contacto_telefono && { icon: Phone, texto: sitio.contacto_telefono, href: `tel:${sitio.contacto_telefono.replace(/\s+/g, '')}` },
        whatsapp && { icon: FaWhatsapp, texto: 'Escríbenos por WhatsApp', href: whatsapp, externo: true },
        sitio.contacto_email && { icon: Mail, texto: sitio.contacto_email, href: `mailto:${sitio.contacto_email}` },
    ].filter(Boolean);

    if (!canales.length) return null;

    return (
        <TarjetaLateral icon={Headset} titulo="¿Necesitas ayuda?">
            <p className="mb-3 text-sm text-primary-700/80">Si tienes dudas para llenar tu reclamo, comunícate con nosotros.</p>
            <ul className="flex flex-col gap-2">
                {canales.map((canal) => (
                    <li key={canal.href}>
                        <a
                            href={canal.href}
                            {...(canal.externo && { target: '_blank', rel: 'noopener noreferrer' })}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary ring-1 ring-primary-100 transition hover:bg-primary-50 hover:ring-primary-200"
                        >
                            <canal.icon className="size-4 shrink-0 text-primary-500" aria-hidden="true" />
                            <span className="min-w-0 break-all">{canal.texto}</span>
                        </a>
                    </li>
                ))}
            </ul>
            {sitio.contacto_horario && (
                <p className="mt-3 flex items-start gap-2 text-xs text-primary-500">
                    <Clock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    {sitio.contacto_horario}
                </p>
            )}
        </TarjetaLateral>
    );
}
