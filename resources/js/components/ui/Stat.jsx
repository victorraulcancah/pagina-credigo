import { cn } from '@/lib/utils';

/**
 * Cifra destacada (ej. "650+" conductores). `light` para fondos azules.
 * Los valores largos (ej. "Yango · InDrive") se muestran más chicos para no desbordar.
 */
export default function Stat({ value, label, light = false, compact = false, className }) {
    const largo = String(value).length > 6;

    return (
        <div className={cn('text-center', className)}>
            <p
                className={cn(
                    'font-extrabold tracking-tight text-balance',
                    compact
                        ? largo ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'
                        : largo ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-4xl sm:text-5xl',
                    light ? 'text-accent' : 'text-primary',
                )}
            >
                {value}
            </p>
            <p className={cn('mt-1 text-sm font-medium sm:text-base', light ? 'text-primary-100' : 'text-primary-700/80')}>
                {label}
            </p>
        </div>
    );
}
