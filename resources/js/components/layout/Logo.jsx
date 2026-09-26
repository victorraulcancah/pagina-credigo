import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

/** Logo de CrediGo (fondo amarillo propio: se ve bien sobre azul y sobre blanco). */
export default function Logo({ className, href = '/' }) {
    return (
        <Link href={href} aria-label="CrediGo - Ir al inicio" className="inline-flex shrink-0">
            <img
                src="/images/logos/credigo.png"
                alt="CrediGo"
                width="217"
                height="132"
                className={cn('h-10 w-auto sm:h-12', className)}
            />
        </Link>
    );
}
