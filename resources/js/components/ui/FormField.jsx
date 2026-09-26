import { cn } from '@/lib/utils';

/**
 * Etiqueta + campo + mensaje de error/ayuda.
 * <FormField label="Nombre" htmlFor="nombre" error={errors.nombre} required>
 *     <Input id="nombre" error={errors.nombre} />
 * </FormField>
 */
export default function FormField({ label, htmlFor, error, hint, required = false, className, children }) {
    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            {label && (
                <label htmlFor={htmlFor} className="text-sm font-semibold text-primary">
                    {label}
                    {required && <span className="ml-0.5 text-red-600">*</span>}
                </label>
            )}
            {children}
            {error ? (
                <p className="text-sm text-red-600" role="alert">
                    {error}
                </p>
            ) : (
                hint && <p className="text-sm text-primary-400">{hint}</p>
            )}
        </div>
    );
}
