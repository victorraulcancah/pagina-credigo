import { cn } from '@/lib/utils';

/** Contenedor blanco con borde suave. `hover` agrega elevación al pasar el mouse. */
export default function Card({ as: Tag = 'div', hover = false, className, children, ...props }) {
    return (
        <Tag
            className={cn(
                'rounded-2xl bg-white p-6 text-primary shadow-sm ring-1 ring-primary-100 sm:p-8',
                hover && 'transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10',
                className,
            )}
            {...props}
        >
            {children}
        </Tag>
    );
}
