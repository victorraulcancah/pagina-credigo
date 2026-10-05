import { formatoFecha } from '@/lib/fechas';
import { cn } from '@/lib/utils';

// fecha_limite viene como "2026-10-17": se lee a mediodía para evitar desfases de zona horaria
export const fechaLocal = (fecha) => new Date(`${fecha}T12:00:00`);
export const diasRestantes = (fecha) => Math.ceil((fechaLocal(fecha) - new Date().setHours(12, 0, 0, 0)) / 86_400_000);

/** Estado del plazo legal de una hoja: atendida, vencida, por vencer (3 días o menos) o a tiempo. */
export function estadoPlazo(reclamacion) {
    if (reclamacion.estado === 'atendido') return 'atendido';
    if (reclamacion.vencido) return 'vencido';
    return diasRestantes(reclamacion.fecha_limite) <= 3 ? 'urgente' : 'a_tiempo';
}

const ESTILOS = {
    atendido: 'bg-green-100 text-green-700',
    vencido: 'bg-red-100 text-red-700',
    urgente: 'bg-amber-100 text-amber-800',
    a_tiempo: 'bg-gray-100 text-gray-600',
};

/** Etiqueta del plazo para las filas de la bandeja. */
export default function Plazo({ reclamacion }) {
    const estado = estadoPlazo(reclamacion);
    const texto = {
        atendido: 'Atendido',
        vencido: 'Plazo vencido',
    }[estado] ?? `Vence ${formatoFecha(fechaLocal(reclamacion.fecha_limite), false)}`;

    return <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', ESTILOS[estado])}>{texto}</span>;
}
