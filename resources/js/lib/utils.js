import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Une clases de Tailwind resolviendo conflictos (igual que en el ERP). */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
