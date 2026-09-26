import Badge from '@/components/ui/Badge';
import Container from '@/components/ui/Container';
import { cn } from '@/lib/utils';

/**
 * Encabezado azul para páginas internas (Nosotros, Servicios, Contacto).
 * `imagen`: foto de fondo opcional (se oscurece para que el texto se lea).
 * `children` se muestra debajo como fila de botones.
 */
export default function PageHero({ eyebrow, title, description, imagen, align = 'left', children }) {
    const centered = align === 'center';

    return (
        <section className="relative overflow-hidden bg-primary text-white">
            {imagen ? (
                <div aria-hidden="true" className="absolute inset-0">
                    <img src={imagen} alt="" fetchPriority="high" className="size-full object-cover" />
                    <div className="absolute inset-0 bg-primary/75 lg:hidden" />
                    <div
                        className={cn(
                            'absolute inset-0 hidden lg:block',
                            centered ? 'bg-primary/70' : 'bg-linear-to-r from-primary via-primary/80 to-primary/10',
                        )}
                    />
                </div>
            ) : (
                <>
                    <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-72 resplandor-acento sm:size-96" />
                    <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 size-72 resplandor-claro" />
                </>
            )}
            <Container className={cn('relative py-16 sm:py-20 lg:py-28', imagen && 'lg:py-32', centered && 'text-center')}>
                <div className={cn('max-w-3xl', centered && 'mx-auto')}>
                    {eyebrow && <Badge className="mb-5">{eyebrow}</Badge>}
                    <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-5 text-base text-pretty text-white/85 sm:text-lg lg:text-xl">{description}</p>
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
