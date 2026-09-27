import { Paperclip, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const formatoTamano = (bytes) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`);

/**
 * Selector de archivos con lista de elegidos y control de tamaño en el navegador
 * (avisa antes de enviar si un archivo pesa más de lo permitido).
 * `multiple`: value es un arreglo de File; si no, un File o null.
 */
export default function ArchivoInput({ id, label, hint, accept, maxMb, multiple = false, max = 5, value, onChange, error }) {
    const inputRef = useRef(null);
    const [aviso, setAviso] = useState(null);
    const archivos = multiple ? value : value ? [value] : [];

    const elegir = (e) => {
        const elegidos = Array.from(e.target.files ?? []);
        e.target.value = '';

        const pesados = elegidos.filter((archivo) => archivo.size > maxMb * 1048576);
        const validos = elegidos.filter((archivo) => archivo.size <= maxMb * 1048576);
        setAviso(pesados.length ? `${pesados.map((a) => a.name).join(', ')} pesa más de ${maxMb} MB.` : null);

        if (!validos.length) return;
        onChange(multiple ? [...archivos, ...validos].slice(0, max) : validos[0]);
    };

    const quitar = (indice) => onChange(multiple ? archivos.filter((_, i) => i !== indice) : null);
    const puedeAgregar = multiple ? archivos.length < max : archivos.length === 0;

    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-primary">{label}</p>
            {archivos.map((archivo, i) => (
                <div key={`${archivo.name}-${i}`} className="flex items-center gap-3 rounded-xl bg-primary-50 px-3 py-2 text-sm">
                    <Paperclip className="size-4 shrink-0 text-primary-500" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-primary">{archivo.name}</span>
                    <span className="shrink-0 text-xs text-primary-500">{formatoTamano(archivo.size)}</span>
                    <button type="button" onClick={() => quitar(i)} aria-label={`Quitar ${archivo.name}`} className="rounded-md p-1 text-primary-500 hover:bg-white hover:text-red-600">
                        <X className="size-4" />
                    </button>
                </div>
            ))}
            {puedeAgregar && (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className={cn(
                        'flex items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-sm font-semibold transition',
                        error || aviso ? 'border-red-300 text-red-600' : 'border-primary-200 text-primary-600 hover:border-primary hover:text-primary',
                    )}
                >
                    <Paperclip className="size-4" aria-hidden="true" /> {archivos.length ? 'Agregar otro' : 'Elegir archivo'}
                </button>
            )}
            <input ref={inputRef} id={id} type="file" accept={accept} multiple={multiple} className="hidden" onChange={elegir} />
            {aviso || error ? (
                <p className="text-sm text-red-600" role="alert">
                    {aviso || error}
                </p>
            ) : (
                hint && <p className="text-xs text-primary-400">{hint}</p>
            )}
        </div>
    );
}
