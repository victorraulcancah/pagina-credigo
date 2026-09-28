import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Une clases de Tailwind resolviendo conflictos (igual que en el ERP). */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/** "Victor Canchari" → "VC" */
export const iniciales = (nombre = '') =>
    nombre
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((parte) => parte[0]?.toUpperCase())
        .join('');

/** Sombra suave para que títulos y textos se lean sobre una foto de fondo. */
export const SOMBRA_TEXTO = 'text-shadow-lg text-shadow-black/35';

const COLUMNAS_LG = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
};

/** Columnas en escritorio según la cantidad de elementos (máx. 4). */
export function columnasLg(cantidad) {
    return COLUMNAS_LG[Math.min(Math.max(cantidad, 1), 4)];
}
