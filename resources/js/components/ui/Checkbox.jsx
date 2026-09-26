import { cn } from '@/lib/utils';

/**
 * Casilla con texto (el texto puede incluir enlaces).
 * <Checkbox checked={...} onChange={(v) => ...} error={errors.x}>Acepto la <a>política</a></Checkbox>
 */
export default function Checkbox({ id, checked, onChange, error, className, children }) {
    return (
        <div className={className}>
            <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-primary-700 sm:text-base">
                <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    aria-invalid={error ? true : undefined}
                    className={cn('mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-primary', error && 'outline-2 outline-red-500')}
                />
                <span>{children}</span>
            </label>
            {error && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
