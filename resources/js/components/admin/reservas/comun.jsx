import { whatsappDe } from '@/components/admin/solicitudes/estados';
import { cn } from '@/lib/utils';

/**
 * Colores de cada estado de una reserva.
 * - solido: botón/etiqueta activa · suave: etiqueta en listas · punto: indicador · borde: borde izquierdo de la fila
 */
export const ESTADO_RESERVA_UI = {
    pendiente: { solido: 'bg-accent text-primary', suave: 'bg-accent-100 text-accent-900', punto: 'bg-accent-500', borde: 'border-l-accent-500' },
    confirmada: { solido: 'bg-sky-600 text-white', suave: 'bg-sky-100 text-sky-800', punto: 'bg-sky-500', borde: 'border-l-sky-500' },
    atendida: { solido: 'bg-emerald-600 text-white', suave: 'bg-emerald-100 text-emerald-800', punto: 'bg-emerald-500', borde: 'border-l-emerald-500' },
    cancelada: { solido: 'bg-gray-500 text-white', suave: 'bg-gray-100 text-gray-600', punto: 'bg-gray-400', borde: 'border-l-gray-300' },
};

export const estadoReservaUi = (estado) => ESTADO_RESERVA_UI[estado] ?? ESTADO_RESERVA_UI.pendiente;

const aFecha = (fecha) => new Date(`${fecha}T12:00:00`);

/** "lunes 20 de octubre" */
export const fechaLarga = (fecha) => new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }).format(aFecha(fecha));

/** Hoy / Mañana / Ayer, o null (para destacar las reservas cercanas). */
export function cercania(fecha) {
    const hoy = new Date();
    hoy.setHours(12, 0, 0, 0);
    const dias = Math.round((aFecha(fecha) - hoy) / 86400000);
    return { 0: 'Hoy', 1: 'Mañana', [-1]: 'Ayer' }[dias] ?? null;
}

/** WhatsApp al cliente con un saludo sobre su reserva. */
export const whatsappReserva = (reserva, empresa) =>
    `${whatsappDe(reserva.telefono)}?text=${encodeURIComponent(
        `Hola ${reserva.nombre}, te escribimos de ${empresa} por tu reserva (${reserva.tipo}) del ${fechaLarga(reserva.fecha)}${reserva.hora ? ` a las ${reserva.hora}` : ''}.`,
    )}`;

/** Fecha de la reserva como hoja de calendario: día de la semana, número y mes. */
export function HojaFecha({ fecha, className, oscura = false }) {
    const partes = new Intl.DateTimeFormat('es-PE', { weekday: 'short', day: 'numeric', month: 'short' }).formatToParts(aFecha(fecha));
    const parte = (tipo) => partes.find((p) => p.type === tipo)?.value.replace('.', '');

    return (
        <span
            className={cn(
                'flex w-14 shrink-0 flex-col items-center overflow-hidden rounded-xl text-center ring-1',
                oscura ? 'bg-white text-primary ring-white' : 'bg-white text-gray-900 ring-gray-200',
                className,
            )}
        >
            <span className={cn('w-full py-0.5 text-[0.625rem] font-bold tracking-wider uppercase', oscura ? 'bg-accent text-primary' : 'bg-primary text-white')}>
                {parte('weekday')}
            </span>
            <span className="pt-1 text-xl leading-none font-extrabold tabular-nums">{parte('day')}</span>
            <span className="pb-1.5 text-[0.6875rem] font-semibold text-gray-500 uppercase">{parte('month')}</span>
        </span>
    );
}
