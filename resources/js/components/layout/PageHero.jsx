import Badge from '@/components/ui/Badge';
import Container from '@/components/ui/Container';
import Revelar from '@/components/ui/Revelar';
import { cn, SOMBRA_TEXTO } from '@/lib/utils';

/**
 * Encabezado azul para páginas internas (Nosotros, Servicios, Contacto).
 * `imagen`: foto de fondo opcional, se muestra tal cual (el texto lleva sombra suave).
 * `children` se muestra debajo como fila de botones.
 */
export default function PageHero({ eyebrow, title, description, imagen, align = 'left', children }) {
    const centered = align === 'center';

    return (
        <section className="relative overflow-clip bg-primary text-white">
            {imagen ? (
                // Imagen tal cual se subió (sin capa oscura)
                <img src={imagen} alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 size-full object-cover" />
            ) : (
                <>
                    <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-72 resplandor-acento sm:size-96" />
                    <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 size-72 resplandor-claro" />
                </>
            )}
            <Container className={cn('relative py-16 sm:py-20 lg:py-28', imagen && 'lg:py-32', centered && 'text-center')}>
                <div className={cn('max-w-3xl', centered && 'mx-auto')}>
                    {eyebrow && (
                        <Revelar className="mb-5">
                            <Badge>{eyebrow}</Badge>
                        </Revelar>
                    )}
                    <Revelar
                        as="h1"
                        retraso={100}
                        className={cn(
                            'text-4xl leading-tight font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl',
                            imagen && SOMBRA_TEXTO,
                        )}
                    >
                        {title}
                    </Revelar>
                    {description && (
                        <Revelar
                            as="p"
                            retraso={200}
                            className={cn('mt-5 text-base text-pretty text-white/85 sm:text-lg lg:text-xl', imagen && SOMBRA_TEXTO)}
                        >
                            {description}
                        </Revelar>
                    )}
                    {children && (
                        <Revelar retraso={300} className={cn('mt-8 flex flex-col gap-3 sm:flex-row', centered && 'sm:justify-center')}>
                            {children}
                        </Revelar>
                    )}
                </div>
            </Container>
        </section>
    );
}
