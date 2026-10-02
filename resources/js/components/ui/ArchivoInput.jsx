import { Paperclip, Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { formatoTamano } from '@/lib/archivos';
import { cn } from '@/lib/utils';

/** ¿El archivo coincide con `accept` ("image/png,.ico,video/mp4")? */
const aceptaTipo = (archivo, accept) =>
    !accept ||
    accept.split(',').some((tipo) => {
        const t = tipo.trim().toLowerCase();
        return t.startsWith('.') ? archivo.name.toLowerCase().endsWith(t) : archivo.type === t;
    });

/**
 * Tarjeta para adjuntar archivos: clic o arrastrar y soltar. Muestra los elegidos
 * y avisa antes de enviar si alguno pesa más de lo permitido o no es del formato.
 * `multiple`: value es un arreglo de File; si no, un File o null.
 */
export default function ArchivoInput({ id, icon: Icono = Paperclip, titulo, formatos, accept, maxMb, multiple = false, max = 5, value, onChange, error }) {
    const inputRef = useRef(null);
    const [aviso, setAviso] = useState(null);
    const [arrastrando, setArrastrando] = useState(false);
    const archivos = multiple ? value : value ? [value] : [];
    const puedeAgregar = multiple ? archivos.length < max : archivos.length === 0;

    const agregar = (lista) => {
        const elegidos = Array.from(lista ?? []);
        const invalidos = elegidos.filter((a) => !aceptaTipo(a, accept));
        const pesados = elegidos.filter((a) => aceptaTipo(a, accept) && a.size > maxMb * 1048576);
        const validos = elegidos.filter((a) => aceptaTipo(a, accept) && a.size <= maxMb * 1048576);

        setAviso(
            [
                invalidos.length && `${invalidos.map((a) => a.name).join(', ')}: formato no permitido.`,
                pesados.length && `${pesados.map((a) => a.name).join(', ')} pesa más de ${maxMb} MB.`,
            ]
                .filter(Boolean)
                .join(' ') || null,
        );

        if (!validos.length) return;
        onChange(multiple ? [...archivos, ...validos].slice(0, max) : validos[0]);
    };

    const quitar = (indice) => onChange(multiple ? archivos.filter((_, i) => i !== indice) : null);
    const abrir = () => inputRef.current?.click();
    const hayError = Boolean(error || aviso);

    const soltar = (e) => {
        e.preventDefault();
        setArrastrando(false);
        if (puedeAgregar) agregar(e.dataTransfer.files);
    };

    return (
        <div className="flex h-full flex-col gap-2">
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    if (puedeAgregar) setArrastrando(true);
                }}
                onDragLeave={() => setArrastrando(false)}
                onDrop={soltar}
                className={cn(
                    'flex min-h-44 flex-1 flex-col rounded-2xl border-2 border-dashed transition',
                    hayError ? 'border-red-300 bg-red-50/40' : arrastrando ? 'border-primary bg-primary-50' : archivos.length ? 'border-primary-200 bg-white' : 'border-primary-200 bg-primary-50/40',
                )}
            >
                {archivos.length === 0 ? (
                    <button
                        type="button"
                        onClick={abrir}
                        className="group flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl p-5 text-center transition hover:bg-primary-50"
                    >
                        <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-primary-100 transition group-hover:bg-accent">
                            <Icono className="size-6" aria-hidden="true" />
                        </span>
                        <span>
                            <span className="block font-semibold text-primary">{titulo}</span>
                            <span className="mt-0.5 block text-xs text-primary-500">{formatos}</span>
                            <span className="mt-2 hidden text-xs text-primary-400 sm:block">o arrastra el archivo aquí</span>
                        </span>
                    </button>
                ) : (
                    <div className="flex flex-1 flex-col gap-2 p-3">
                        <p className="flex items-center gap-2 px-1 text-sm font-semibold text-primary">
                            <Icono className="size-4" aria-hidden="true" /> {titulo}
                        </p>
                        {archivos.map((archivo, i) => (
                            <div key={`${archivo.name}-${i}`} className="flex items-center gap-2 rounded-xl bg-primary-50 px-3 py-2 text-sm">
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate font-medium text-primary">{archivo.name}</span>
                                    <span className="block text-xs text-primary-500">{formatoTamano(archivo.size)}</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => quitar(i)}
                                    aria-label={`Quitar ${archivo.name}`}
                                    className="rounded-lg p-1.5 text-primary-500 transition hover:bg-white hover:text-red-600"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        ))}
                        {puedeAgregar && (
                            <button
                                type="button"
                                onClick={abrir}
                                className="mt-auto flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary-200 py-2 text-xs font-semibold text-primary transition hover:border-primary hover:bg-primary-50"
                            >
                                <Plus className="size-3.5" aria-hidden="true" /> Agregar otra ({archivos.length}/{max})
                            </button>
                        )}
                    </div>
                )}
            </div>
            <input
                ref={inputRef}
                id={id}
                type="file"
                accept={accept}
                multiple={multiple}
                className="hidden"
                onChange={(e) => {
                    agregar(e.target.files);
                    e.target.value = ''; // permite volver a elegir el mismo archivo
                }}
            />
            {hayError && (
                <p className="text-sm text-red-600" role="alert">
                    {aviso || error}
                </p>
            )}
        </div>
    );
}
