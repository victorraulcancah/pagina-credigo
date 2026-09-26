import { cn } from '@/lib/utils';

/** Cifra destacada (ej. "+650" conductores). `light` para fondos azules. */
export default function Stat({ value, label, light = false, className }) {
    return (
        <div className={cn('text-center', className)}>
            <p
                className={cn(
                    'text-4xl font-extrabold tracking-tight sm:text-5xl',
                    light ? 'text-accent' : 'text-primary',
                )}
            >
                {value}
            </p>
            <p className={cn('mt-2 text-sm font-medium sm:text-base', light ? 'text-primary-100' : 'text-primary-700/80')}>
                {label}
            </p>
        </div>
    );
}
