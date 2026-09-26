import { cn } from '@/lib/utils';

export const fieldClasses = (error) =>
    cn(
        'w-full rounded-xl border bg-white px-4 text-sm text-primary transition sm:text-base',
        'placeholder:text-primary-300 focus:ring-2 focus:outline-none',
        'disabled:cursor-not-allowed disabled:bg-primary-50',
        error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
            : 'border-primary-200 focus:border-primary focus:ring-accent',
    );

/** Campo de texto. `error` pinta el borde en rojo (el mensaje lo muestra FormField). */
export default function Input({ error, className, type = 'text', ...props }) {
    return (
        <input
            type={type}
            aria-invalid={error ? true : undefined}
            className={cn(fieldClasses(error), 'h-11 sm:h-12', className)}
            {...props}
        />
    );
}
