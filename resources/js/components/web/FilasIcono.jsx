import Icono from '@/components/ui/Icono';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import { cn } from '@/lib/utils';

/**
 * Elementos de una sección (items: titulo, descripcion, icono) como filas con líneas finas
 * y su ícono en un cuadro azul, en vez de tarjetas iguales. `claro`: sobre fondo azul.
 */
export default function FilasIcono({ items = [], fallback = 'Check', claro = false, className }) {
    if (!items.length) return null;

    return (
        <ul className={cn('divide-y border-y', claro ? 'divide-white/15 border-white/15' : 'divide-primary-100 border-primary-100', className)}>
            {items.map((item, i) => (
                <Revelar as="li" key={i} retraso={escalonar(i, 80)} className="flex items-start gap-4 py-5 sm:gap-5">
                    <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl', claro ? 'bg-accent text-primary' : 'bg-primary text-accent')}>
                        <Icono nombre={item.icono} fallback={fallback} className="size-6" />
                    </span>
                    <div className="min-w-0 pt-0.5">
                        <h3 className={cn('text-lg font-bold', claro ? 'text-white' : 'text-primary')}>{item.titulo}</h3>
                        {item.descripcion && <p className={cn('mt-1 whitespace-pre-line', claro ? 'text-white/70' : 'text-primary-700/80')}>{item.descripcion}</p>}
                    </div>
                </Revelar>
            ))}
        </ul>
    );
}
