import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Ventana modal con <dialog> nativo (Escape y foco manejados por el navegador).
 * `footer` se muestra fijo abajo; para enviar un formulario del cuerpo usar
 * <Button type="submit" form="id-del-form">.
 */
export default function Modal({ open, onClose, title, description, footer, maxWidth = 'max-w-2xl', children }) {
    const ref = useRef(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            onCancel={(e) => {
                e.preventDefault();
                onClose();
            }}
            onClick={(e) => e.target === ref.current && onClose()}
            className={cn(
                'm-auto w-[calc(100%-1.5rem)] rounded-2xl bg-white p-0 text-gray-900 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm',
                maxWidth,
            )}
        >
            {open && (
                <div className="flex max-h-[90dvh] flex-col">
                    <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold">{title}</h2>
                            {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Cerrar"
                            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                        >
                            <X className="size-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
                    {footer && (
                        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                            {footer}
                        </div>
                    )}
                </div>
            )}
        </dialog>
    );
}
