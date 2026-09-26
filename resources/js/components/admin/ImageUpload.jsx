import { ImagePlus, Trash, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Subida de imagen con vista previa.
 * - `actualUrl`: imagen guardada · `archivo`: File nuevo elegido
 * - `quitada`/`onQuitar`: marca para borrar la imagen guardada (campo quitar_*)
 */
export default function ImageUpload({
    label,
    actualUrl,
    archivo,
    onArchivo,
    quitada = false,
    onQuitar,
    error,
    hint,
    aspect = 'aspect-video',
    fondo = 'bg-gray-100',
    accept = 'image/png,image/jpeg,image/webp',
}) {
    const inputRef = useRef(null);
    const previewNueva = useMemo(() => (archivo ? URL.createObjectURL(archivo) : null), [archivo]);

    useEffect(() => () => previewNueva && URL.revokeObjectURL(previewNueva), [previewNueva]);

    const preview = previewNueva ?? (quitada ? null : actualUrl);
    const abrir = () => inputRef.current?.click();

    const elegir = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onArchivo(file);
            onQuitar?.(false);
        }
        e.target.value = '';
    };

    const quitar = () => {
        onArchivo(null);
        if (actualUrl) onQuitar?.(true);
    };

    return (
        <div>
            {label && <p className="mb-1.5 text-sm font-semibold text-primary">{label}</p>}
            <div
                className={cn(
                    'relative overflow-hidden rounded-xl border-2 border-dashed',
                    error ? 'border-red-400' : 'border-gray-300',
                    fondo,
                    aspect,
                )}
            >
                {preview ? (
                    <img src={preview} alt="" className="size-full object-contain" />
                ) : (
                    <button
                        type="button"
                        onClick={abrir}
                        className="flex size-full flex-col items-center justify-center gap-2 p-4 text-gray-500 transition hover:text-primary"
                    >
                        <ImagePlus className="size-8" aria-hidden="true" />
                        <span className="text-sm font-medium">Subir imagen</span>
                    </button>
                )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={abrir}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    <Upload className="size-4" aria-hidden="true" /> {preview ? 'Cambiar' : 'Elegir archivo'}
                </button>
                {preview && (
                    <button
                        type="button"
                        onClick={quitar}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                        <Trash className="size-4" aria-hidden="true" /> Quitar
                    </button>
                )}
            </div>
            <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={elegir} />
            {error ? (
                <p className="mt-1 text-sm text-red-600" role="alert">
                    {error}
                </p>
            ) : (
                hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>
            )}
        </div>
    );
}
