import { ArrowDown, ArrowUp, Plus, Trash } from 'lucide-react';
import IconPicker from '@/components/admin/IconPicker';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';

function BotonIcono({ onClick, label, disabled, peligro = false, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className={cn(
                'flex size-8 items-center justify-center rounded-lg transition disabled:opacity-30',
                peligro ? 'text-red-600 hover:bg-red-50' : 'text-gray-600 hover:bg-white',
            )}
        >
            {children}
        </button>
    );
}

/**
 * Lista editable de elementos { titulo, descripcion, icono } (pasos, valores, cifras).
 * Los errores llegan como errors["items.0.titulo"].
 */
export default function ItemsRepeater({
    items,
    onChange,
    errors = {},
    conIcono = true,
    etiquetas = { titulo: 'Título', descripcion: 'Descripción' },
    max = 12,
}) {
    const actualizar = (i, campo, valor) => onChange(items.map((item, j) => (j === i ? { ...item, [campo]: valor } : item)));

    const mover = (i, paso) => {
        const nuevos = [...items];
        const [item] = nuevos.splice(i, 1);
        nuevos.splice(i + paso, 0, item);
        onChange(nuevos);
    };

    const agregar = () => onChange([...items, { titulo: '', descripcion: '', icono: conIcono ? 'Sparkles' : null }]);

    return (
        <div className="flex flex-col gap-3">
            {items.map((item, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="text-xs font-bold tracking-wide text-gray-500 uppercase">Elemento {i + 1}</span>
                        <div className="flex gap-1">
                            <BotonIcono onClick={() => mover(i, -1)} disabled={i === 0} label="Subir">
                                <ArrowUp className="size-4" />
                            </BotonIcono>
                            <BotonIcono onClick={() => mover(i, 1)} disabled={i === items.length - 1} label="Bajar">
                                <ArrowDown className="size-4" />
                            </BotonIcono>
                            <BotonIcono onClick={() => onChange(items.filter((_, j) => j !== i))} label="Quitar" peligro>
                                <Trash className="size-4" />
                            </BotonIcono>
                        </div>
                    </div>
                    <div className={cn('grid gap-3', conIcono && 'sm:grid-cols-2')}>
                        <FormField label={etiquetas.titulo} htmlFor={`item-${i}-titulo`} error={errors[`items.${i}.titulo`]} required>
                            <Input
                                id={`item-${i}-titulo`}
                                value={item.titulo ?? ''}
                                onChange={(e) => actualizar(i, 'titulo', e.target.value)}
                                error={errors[`items.${i}.titulo`]}
                            />
                        </FormField>
                        {conIcono && (
                            <FormField label="Ícono" htmlFor={`item-${i}-icono`}>
                                <IconPicker id={`item-${i}-icono`} value={item.icono} onChange={(icono) => actualizar(i, 'icono', icono)} />
                            </FormField>
                        )}
                        <FormField
                            label={etiquetas.descripcion}
                            htmlFor={`item-${i}-descripcion`}
                            error={errors[`items.${i}.descripcion`]}
                            className={cn(conIcono && 'sm:col-span-2')}
                        >
                            <Textarea
                                id={`item-${i}-descripcion`}
                                rows={2}
                                value={item.descripcion ?? ''}
                                onChange={(e) => actualizar(i, 'descripcion', e.target.value)}
                                error={errors[`items.${i}.descripcion`]}
                            />
                        </FormField>
                    </div>
                </div>
            ))}
            {items.length < max && (
                <button
                    type="button"
                    onClick={agregar}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-semibold text-gray-600 transition hover:border-primary hover:text-primary"
                >
                    <Plus className="size-4" aria-hidden="true" /> Agregar elemento
                </button>
            )}
        </div>
    );
}
