import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Icono from '@/components/ui/Icono';
import { nombresIconos } from '@/lib/iconos';
import { cn } from '@/lib/utils';

/** Elige un ícono de la lista permitida (lib/iconos.js). */
export default function IconPicker({ id, value, onChange }) {
    const [abierto, setAbierto] = useState(false);

    return (
        <div>
            <button
                id={id}
                type="button"
                onClick={() => setAbierto((v) => !v)}
                aria-expanded={abierto}
                className="flex h-11 w-full items-center gap-3 rounded-xl border border-primary-200 bg-white px-3 text-sm text-primary transition hover:border-primary sm:h-12"
            >
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-primary">
                    <Icono nombre={value} className="size-4" />
                </span>
                <span className="flex-1 truncate text-left">{value || 'Elegir ícono'}</span>
                <ChevronDown className={cn('size-5 text-primary-400 transition', abierto && 'rotate-180')} aria-hidden="true" />
            </button>
            {abierto && (
                <div className="mt-2 grid grid-cols-6 gap-1.5 rounded-xl border border-gray-200 bg-white p-2 sm:grid-cols-9">
                    {nombresIconos.map((nombre) => (
                        <button
                            key={nombre}
                            type="button"
                            title={nombre}
                            aria-label={nombre}
                            aria-pressed={value === nombre}
                            onClick={() => {
                                onChange(nombre);
                                setAbierto(false);
                            }}
                            className={cn(
                                'flex aspect-square items-center justify-center rounded-lg transition',
                                value === nombre ? 'bg-primary text-accent' : 'text-gray-600 hover:bg-gray-100',
                            )}
                        >
                            <Icono nombre={nombre} className="size-5" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
