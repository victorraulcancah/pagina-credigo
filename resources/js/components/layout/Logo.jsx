import { Link } from '@inertiajs/react';
import { useSitio } from '@/hooks/useSitio';
import { cn } from '@/lib/utils';

// Alto de cada logo por lugar. El de la empresa va un paso más bajo porque es un bloque
// amarillo macizo y pesa más a la vista que el logo de CrediGo, que es solo letras.
const TAMANOS = {
    nav: { empresa: 'h-7 sm:h-8', marca: 'h-8 sm:h-10', linea: 'h-6 sm:h-7', espacio: 'gap-2.5 sm:gap-3.5' },
    pie: { empresa: 'h-10', marca: 'h-12', linea: 'h-9', espacio: 'gap-4' },
    login: { empresa: 'h-11 sm:h-14', marca: 'h-14 sm:h-18', linea: 'h-10 sm:h-12', espacio: 'gap-4 sm:gap-5' },
    panel: { empresa: 'h-6', marca: 'h-8', linea: 'h-6', espacio: 'gap-2' },
};

/**
 * Los dos logos juntos (empresa | marca) separados por una línea fina, para fondos del
 * color principal. Solo dibuja: recibe las imágenes (la vista previa de Apariencia
 * le pasa las que se están por guardar).
 * - `empresaClassName`: clases extra del logo de la empresa y la línea (ej. ocultarlos).
 */
export function ParLogos({ empresa, marca, tamano = 'nav', empresaClassName, className }) {
    const t = TAMANOS[tamano];

    return (
        <span className={cn('inline-flex shrink-0 items-center', t.espacio, className)}>
            <img src={empresa} alt="" className={cn('w-auto object-contain', t.empresa, empresaClassName)} />
            <span aria-hidden="true" className={cn('w-px shrink-0 bg-white/25', t.linea, empresaClassName)} />
            <img src={marca} alt="" className={cn('w-auto object-contain', t.marca)} />
        </span>
    );
}

/**
 * Logo de Arequipa GO junto al de CrediGo, en el menú, el pie, el login y el panel.
 * Los dos se cambian en el panel → Apariencia.
 * - `href`: a dónde lleva; `null` lo deja sin enlace (cuando ya va dentro de otro enlace).
 * - `etiqueta`: lo que anuncia el enlace a los lectores de pantalla.
 */
export default function Logo({ tamano = 'nav', href = '/', etiqueta = 'Ir al inicio', empresaClassName, className }) {
    const sitio = useSitio();
    const nombre = [sitio.empresa_razon_social, sitio.empresa_nombre].filter(Boolean).join(' · ');
    const logos = <ParLogos empresa={sitio.logoEmpresa} marca={sitio.logo} tamano={tamano} empresaClassName={empresaClassName} />;

    if (!href) {
        return (
            <span role="img" aria-label={nombre} className={cn('inline-flex shrink-0', className)}>
                {logos}
            </span>
        );
    }

    return (
        <Link href={href} aria-label={`${nombre} - ${etiqueta}`} className={cn('inline-flex shrink-0 rounded-lg', className)}>
            {logos}
        </Link>
    );
}
