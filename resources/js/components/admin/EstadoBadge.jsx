import { cn } from '@/lib/utils';

/** Etiqueta Visible / Oculto para contenido del sitio. */
export default function EstadoBadge({ activo, className }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500',
                className,
            )}
        >
            <span className={cn('size-1.5 rounded-full', activo ? 'bg-green-500' : 'bg-gray-400')} />
            {activo ? 'Visible' : 'Oculto'}
        </span>
    );
}
