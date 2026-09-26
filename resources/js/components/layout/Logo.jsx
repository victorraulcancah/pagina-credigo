import { Link } from '@inertiajs/react';
import { useSitio } from '@/hooks/useSitio';
import { cn } from '@/lib/utils';

/** Logo del sitio (se cambia en el panel → Apariencia). */
export default function Logo({ className, href = '/' }) {
    const sitio = useSitio();

    return (
        <Link href={href} aria-label={`${sitio.empresa_nombre} - Ir al inicio`} className="inline-flex shrink-0">
            <img src={sitio.logo} alt={sitio.empresa_nombre} className={cn('h-10 w-auto object-contain sm:h-12', className)} />
        </Link>
    );
}
