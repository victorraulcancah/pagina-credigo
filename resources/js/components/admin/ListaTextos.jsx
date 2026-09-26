import { ArrowDown, ArrowUp, Plus, Trash } from 'lucide-react';
import Input from '@/components/ui/Input';

/**
 * Lista editable de textos cortos (ej. características de un plan).
 * Los errores llegan como errors["caracteristicas.0"].
 */
export default function ListaTextos({ campo, items, onChange, errors = {}, placeholder, max = 10, textoAgregar = 'Agregar' }) {
    const mover = (i, paso) => {
        const nuevos = [...items];
        const [item] = nuevos.splice(i, 1);
        nuevos.splice(i + paso, 0, item);
        onChange(nuevos);
    };

    return (
        <div className="flex flex-col gap-2">
            {items.map((texto, i) => (
                <div key={i}>
                    <div className="flex items-center gap-1">
                        <Input
                            aria-label={`Elemento ${i + 1}`}
                            value={texto}
                            onChange={(e) => onChange(items.map((t, j) => (j === i ? e.target.value : t)))}
                            error={errors[`${campo}.${i}`]}
                            placeholder={placeholder}
                        />
                        <button
                            type="button"
                            onClick={() => mover(i, -1)}
                            disabled={i === 0}
                            aria-label="Subir"
                            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                        >
                            <ArrowUp className="size-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => mover(i, 1)}
                            disabled={i === items.length - 1}
                            aria-label="Bajar"
                            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                        >
                            <ArrowDown className="size-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange(items.filter((_, j) => j !== i))}
                            aria-label="Quitar"
                            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
                        >
                            <Trash className="size-4" />
                        </button>
                    </div>
                    {errors[`${campo}.${i}`] && <p className="mt-1 text-sm text-red-600">{errors[`${campo}.${i}`]}</p>}
                </div>
            ))}
            {items.length < max && (
                <button
                    type="button"
                    onClick={() => onChange([...items, ''])}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-primary hover:text-primary"
                >
                    <Plus className="size-4" aria-hidden="true" /> {textoAgregar}
                </button>
            )}
        </div>
    );
}
