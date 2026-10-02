import { cn } from '@/lib/utils';

/**
 * Título de sección del estilo del sitio: alineado a la izquierda, sin etiqueta encima,
 * con el texto de la sección debajo. `claro`: sobre fondo azul. `children`: va debajo (ej. un botón).
 */
export default function TituloSeccion({ titulo, contenido, claro = false, as: Tag = 'h2', className, children }) {
    if (!titulo && !contenido && !children) return null;

    return (
        <div className={className}>
            {titulo && (
                <Tag className={cn('max-w-3xl text-3xl leading-[1.08] font-bold tracking-[-0.03em] text-balance sm:text-4xl lg:text-5xl', claro ? 'text-white' : 'text-primary')}>
                    {titulo}
                </Tag>
            )}
            {contenido && <p className={cn('mt-4 max-w-2xl text-lg whitespace-pre-line', claro ? 'text-white/75' : 'text-primary-700/80')}>{contenido}</p>}
            {children}
        </div>
    );
}
