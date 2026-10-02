import Container from '@/components/ui/Container';
import Revelar from '@/components/ui/Revelar';
import { cn, SOMBRA_TEXTO } from '@/lib/utils';

/**
 * Encabezado azul para páginas internas: título grande a la izquierda (sin etiqueta encima)
 * y su texto. `imagen`: foto de fondo opcional del panel, se muestra tal cual (el texto lleva
 * sombra suave). `children` se muestra debajo como fila de botones.
 */
export default function PageHero({ title, description, imagen, align = 'left', children }) {
    const centered = align === 'center';

    return (
        <section className="relative overflow-clip bg-primary text-white">
            {/* Imagen tal cual se subió (sin capa oscura) */}
            {imagen && <img src={imagen} alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 size-full object-cover" />}
            <Container className={cn('relative py-14 sm:py-16 lg:py-20', imagen && 'lg:py-28', centered && 'text-center')}>
                <div className={cn('max-w-3xl', centered && 'mx-auto')}>
                    <Revelar
                        as="h1"
                        className={cn('text-4xl leading-[1.04] font-bold tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl', imagen && SOMBRA_TEXTO)}
                    >
                        {title}
                    </Revelar>
                    {description && (
                        <Revelar
                            as="p"
                            retraso={100}
                            className={cn('mt-5 max-w-2xl text-lg text-pretty text-white/80 sm:text-xl', centered && 'mx-auto', imagen && SOMBRA_TEXTO)}
                        >
                            {description}
                        </Revelar>
                    )}
                    {children && (
                        <Revelar retraso={200} className={cn('mt-8 flex flex-col gap-3 sm:flex-row', centered && 'sm:justify-center')}>
                            {children}
                        </Revelar>
                    )}
                </div>
            </Container>
        </section>
    );
}
