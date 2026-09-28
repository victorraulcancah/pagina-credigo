/**
 * Colores de cada etapa del seguimiento de solicitudes.
 * - solido: botón/etiqueta activa · suave: etiqueta en listas · punto: indicador · borde: borde izquierdo de la fila
 */
export const ESTADO_UI = {
    nuevo: { solido: 'bg-accent text-primary', suave: 'bg-accent-100 text-accent-900', punto: 'bg-accent-500', borde: 'border-l-accent-500' },
    contactado: { solido: 'bg-sky-600 text-white', suave: 'bg-sky-100 text-sky-800', punto: 'bg-sky-500', borde: 'border-l-sky-500' },
    inscrito: { solido: 'bg-emerald-600 text-white', suave: 'bg-emerald-100 text-emerald-800', punto: 'bg-emerald-500', borde: 'border-l-emerald-500' },
    descartado: { solido: 'bg-gray-500 text-white', suave: 'bg-gray-100 text-gray-600', punto: 'bg-gray-400', borde: 'border-l-gray-300' },
};

export const estadoUi = (estado) => ESTADO_UI[estado] ?? ESTADO_UI.nuevo;

export { iniciales } from '@/lib/utils';

/** Link de WhatsApp: a celulares peruanos de 9 dígitos se les agrega el 51. */
export const whatsappDe = (telefono = '') => {
    const numero = telefono.replace(/\D/g, '');
    return `https://wa.me/${numero.length === 9 ? `51${numero}` : numero}`;
};
