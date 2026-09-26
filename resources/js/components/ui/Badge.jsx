import { cn } from '@/lib/utils';

const variants = {
    accent: 'bg-accent text-primary',
    primary: 'bg-primary text-white',
    soft: 'bg-primary-50 text-primary-700',
    outline: 'border border-current bg-transparent',
};

/** Etiqueta pequeña (ej. "Nuevo", "Sobre nosotros"). */
export default function Badge({ variant = 'accent', className, children }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase',
                variants[variant],
                className,
            )}
        >
            {children}
        </span>
    );
}
