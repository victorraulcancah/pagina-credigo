import Container from '@/components/ui/Container';
import Revelar from '@/components/ui/Revelar';
import { cn, SOMBRA_TEXTO } from '@/lib/utils';

/**
 * Encabezado azul para páginas internas: título grande a la izquierda (sin etiqueta encima)
 * y su texto. `imagen`: foto de fondo opcional del panel, se muestra tal cual (el texto lleva
 * sombra suave). `children` se muestra debajo como fila de botones.
 * `colorTitulo` / `colorTexto`: colores elegidos en el panel (vacío = blanco).
 */
export default function PageHero({ title, description, imagen, colorTitulo, colorTexto, align = 'left', children }) {
    const centered = align === 'center';

    return (
        // Con imagen, en pantalla grande el encabezado toma la proporción recomendada de la foto (1920×700) para que se vea
        // completa, no recortada; el texto queda centrado encima y, si es más alto, el encabezado crece
        <section className={cn('relative overflow-clip bg-primary text-white', imagen && 'lg:flex lg:aspect-[1920/700] lg:items-center')}>
            {/* Imagen tal cual se subió (sin capa oscura) */}
            {imagen && <img src={imagen} alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 size-full object-cover" />}
            <Container className={cn('relative py-14 sm:py-16 lg:py-20', imagen && 'lg:py-28', centered && 'text-center')}>
                <div className={cn('max-w-3xl', centered && 'mx-auto')}>
                    <Revelar
                        as="h1"
                        style={colorTitulo ? { color: colorTitulo } : undefined}
                        className={cn('text-4xl leading-[1.04] font-bold tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl', imagen && SOMBRA_TEXTO)}
                    >
                        {title}
                    </Revelar>
                    {description && (
                        <Revelar
                            as="p"
                            retraso={100}
                            style={colorTexto ? { color: colorTexto } : undefined}
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
