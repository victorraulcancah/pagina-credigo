import { cn } from '@/lib/utils';

/** Interruptor encendido/apagado (ej. "Visible en el sitio"). */
export default function Switch({ checked, onChange, label, description, className }) {
    return (
        <label className={cn('flex cursor-pointer items-center justify-between gap-4', className)}>
            <span className="min-w-0">
                <span className="block text-sm font-semibold text-gray-900">{label}</span>
                {description && <span className="block text-xs text-gray-500">{description}</span>}
            </span>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
                    'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none',
                    checked ? 'bg-primary' : 'bg-gray-300',
                )}
            >
                <span
                    className={cn(
                        'inline-block size-5 rounded-full bg-white shadow transition-transform',
                        checked ? 'translate-x-5.5' : 'translate-x-0.5',
                    )}
                />
            </button>
        </label>
    );
}
