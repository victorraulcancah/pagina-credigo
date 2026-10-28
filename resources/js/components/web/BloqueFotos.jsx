import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import { cn } from '@/lib/utils';

// Ancho del bloque; `completo` sale un poco del ancho del texto (clases completas para que Tailwind las detecte)
const ANCHO = {
    pequena: 'max-w-xs',
    mediana: 'max-w-xl',
    grande: 'max-w-full',
    completo: 'relative left-1/2 w-[min(100vw-2rem,64rem)] -translate-x-1/2',
};
const ALINEACION = { centro: 'mx-auto', izquierda: 'mr-auto', derecha: 'ml-auto' };
const PROPORCION = { original: 'h-auto w-full', horizontal: 'aspect-[3/2] w-full object-cover', cuadrada: 'aspect-square w-full object-cover', vertical: 'aspect-[3/4] w-full object-cover' };
const COLUMNAS = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' };
// De dónde entra cada foto al bajar
const ENTRADA = { zoom: 'zoom', abajo: 'abajo', izquierda: 'izquierda', derecha: 'derecha' };

/** Una foto con su pie; con `animar` entra al bajar según la animación del bloque. */
function Foto({ foto, proporcion, animacion, indice, animar, className }) {
    const contenido = (
        <figure className="group">
            <div className="overflow-hidden rounded-[1.5rem] bg-primary-50">
                <img src={foto.src} alt={foto.alt ?? ''} loading="lazy" className={cn(PROPORCION[proporcion] ?? PROPORCION.original, 'transition duration-500 ease-out group-hover:scale-105')} />
            </div>
            {foto.alt && <figcaption className="mt-2 text-center text-sm text-primary-700/70">{foto.alt}</figcaption>}
        </figure>
    );

    return animar && ENTRADA[animacion] ? (
        <Revelar desde={ENTRADA[animacion]} retraso={escalonar(indice, 120)} className={className}>
            {contenido}
        </Revelar>
    ) : (
        <div className={className}>{contenido}</div>
    );
}

function Carrusel({ fotos, proporcion, animacion, animar }) {
    const pista = useRef(null);
    const mover = (sentido) => pista.current?.scrollBy({ left: sentido * pista.current.clientWidth * 0.8, behavior: 'smooth' });
    const flecha = 'absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-lg ring-1 ring-primary-100 transition hover:bg-accent';

    return (
        <div className="relative">
            <div ref={pista} className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {fotos.map((foto, i) => (
                    <Foto key={i} foto={foto} proporcion={proporcion} animacion={animacion} indice={i} animar={animar} className="w-[85%] shrink-0 snap-center sm:w-[60%]" />
                ))}
            </div>
            {fotos.length > 1 && (
                <>
                    <button type="button" aria-label="Foto anterior" onClick={() => mover(-1)} className={cn(flecha, 'left-2')}>
                        <ChevronLeft className="size-5" aria-hidden="true" />
                    </button>
                    <button type="button" aria-label="Foto siguiente" onClick={() => mover(1)} className={cn(flecha, 'right-2')}>
                        <ChevronRight className="size-5" aria-hidden="true" />
                    </button>
                </>
            )}
        </div>
    );
}

/**
 * Bloque de fotos de un artículo del blog. Lo que elige el panel en cada bloque:
 *  diseno (unica: una debajo de otra · galeria: en columnas · carrusel: se desliza) · columnas (2 a 4, en galería) ·
 *  tamano (pequena · mediana · grande · completo) · alineacion · proporcion (original no recorta) · animacion de entrada.
 * `animar`: las fotos aparecen al bajar (en la vista previa del panel van quietas).
 */
export default function BloqueFotos({ bloque, animar = false }) {
    const { fotos = [], diseno = 'galeria', columnas = 3, tamano = 'grande', alineacion = 'centro', proporcion = 'original', animacion = 'zoom' } = bloque;
    if (!fotos.length) return null;

    const props = { proporcion, animacion, animar };

    return (
        <div className={cn('my-2 w-full', ANCHO[tamano] ?? ANCHO.grande, tamano !== 'completo' && (ALINEACION[alineacion] ?? ALINEACION.centro))}>
            {diseno === 'carrusel' ? (
                <Carrusel fotos={fotos} {...props} />
            ) : (
                <div className={cn('grid grid-cols-1 gap-3 sm:gap-4', diseno === 'galeria' && fotos.length > 1 && (COLUMNAS[columnas] ?? COLUMNAS[3]))}>
                    {fotos.map((foto, i) => (
                        <Foto key={i} foto={foto} indice={i} {...props} />
                    ))}
                </div>
            )}
        </div>
    );
}
