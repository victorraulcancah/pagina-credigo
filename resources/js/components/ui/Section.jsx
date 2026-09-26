import Container from '@/components/ui/Container';
import { cn } from '@/lib/utils';

const backgrounds = {
    white: 'bg-white text-primary',
    muted: 'bg-primary-50 text-primary',
    dark: 'bg-primary text-white',
    accent: 'bg-accent text-primary',
};

/**
 * Bloque de página con fondo y espaciado vertical responsivo.
 * `id` permite enlazar con anclas (#contacto); scroll-mt compensa el navbar fijo.
 */
export default function Section({ id, background = 'white', className, containerClassName, children }) {
    return (
        <section id={id} className={cn('scroll-mt-20 py-16 sm:py-20 lg:py-24', backgrounds[background], className)}>
            <Container className={containerClassName}>{children}</Container>
        </section>
    );
}
