import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// Posición de partida antes de aparecer (en celular el desplazamiento lateral es menor)
const DESDE = {
    abajo: 'translate-y-10',
    izquierda: '-translate-x-10 md:-translate-x-20',
    derecha: 'translate-x-10 md:translate-x-20',
    zoom: 'scale-90',
};

/** Retraso para animar una lista uno tras otro (con tope, para que las últimas no esperen demasiado). */
export const escalonar = (indice, paso = 120, maximo = 5) => Math.min(indice, maximo) * paso;

/**
 * Anima su contenido la primera vez que entra en pantalla al hacer scroll.
 * <Revelar desde="derecha" retraso={150}>...</Revelar>
 * `desde`: abajo, izquierda, derecha o zoom. `retraso` en ms para escalonar varios.
 * Si el sistema pide "reducir movimiento" se muestra sin animar.
 */
export default function Revelar({ as: Tag = 'div', desde = 'abajo', retraso = 0, className, style, children, ...props }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const elemento = ref.current;
        const sinAnimacion = !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!elemento || sinAnimacion) {
            setVisible(true);
            return;
        }

        // Se activa cuando el borde superior pasa el 88 % de la pantalla (sirve también para bloques muy altos)
        const observador = new IntersectionObserver(
            ([entrada]) => {
                if (entrada.isIntersecting) {
                    setVisible(true);
                    observador.disconnect();
                }
            },
            { rootMargin: '0px 0px -12% 0px' },
        );
        observador.observe(elemento);

        return () => observador.disconnect();
    }, []);

    return (
        <Tag
            ref={ref}
            style={retraso ? { ...style, transitionDelay: `${retraso}ms` } : style}
            className={cn(
                'transition-[opacity,translate,scale] duration-700 ease-out print:translate-none print:scale-100 print:opacity-100',
                visible ? 'translate-none scale-100 opacity-100' : ['opacity-0', DESDE[desde]],
                className,
            )}
            {...props}
        >
            {children}
        </Tag>
    );
}
