import { Pencil, Trash } from 'lucide-react';

/** Botones Editar / Eliminar de cada fila de las listas del panel. */
export default function AccionesFila({ onEditar, onEliminar }) {
    return (
        <div className="flex shrink-0 gap-1">
            {onEditar && (
                <button
                    type="button"
                    onClick={onEditar}
                    aria-label="Editar"
                    title="Editar"
                    className="flex size-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-primary"
                >
                    <Pencil className="size-4" />
                </button>
            )}
            {onEliminar && (
                <button
                    type="button"
                    onClick={onEliminar}
                    aria-label="Eliminar"
                    title="Eliminar"
                    className="flex size-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-red-50 hover:text-red-600"
                >
                    <Trash className="size-4" />
                </button>
            )}
        </div>
    );
}
