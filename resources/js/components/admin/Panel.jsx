import { cn } from '@/lib/utils';

/** Tarjeta blanca del panel con título opcional. */
export default function Panel({ title, description, className, children }) {
    return (
        <section className={cn('rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-6', className)}>
            {(title || description) && (
                <header className="mb-5">
                    {title && <h2 className="text-lg font-bold text-gray-900">{title}</h2>}
                    {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
                </header>
            )}
            {children}
        </section>
    );
}
