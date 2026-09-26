import Badge from '@/components/ui/Badge';
import Container from '@/components/ui/Container';
import { cn } from '@/lib/utils';

/**
 * Encabezado azul para páginas internas (Nosotros, Servicios, Contacto).
 * `children` se muestra debajo como fila de botones.
 */
export default function PageHero({ eyebrow, title, description, align = 'left', children }) {
    const centered = align === 'center';

    return (
        <section className="relative overflow-hidden bg-primary text-white">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 size-72 resplandor-acento sm:size-96"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-32 -left-24 size-72 resplandor-claro"
            />
            <Container className={cn('relative py-16 sm:py-20 lg:py-28', centered && 'text-center')}>
                <div className={cn('max-w-3xl', centered && 'mx-auto')}>
                    {eyebrow && <Badge className="mb-5">{eyebrow}</Badge>}
                    <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-5 text-base text-pretty text-primary-100 sm:text-lg lg:text-xl">{description}</p>
                    )}
                    {children && (
                        <div className={cn('mt-8 flex flex-col gap-3 sm:flex-row', centered && 'sm:justify-center')}>
                            {children}
                        </div>
                    )}
                </div>
            </Container>
        </section>
    );
}
