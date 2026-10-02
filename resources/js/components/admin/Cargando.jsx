import { LoaderCircle, RotateCw, TriangleAlert } from 'lucide-react';
import Button from '@/components/ui/Button';

/**
 * Estado de una pantalla del panel mientras pide sus datos a la API, o si no pudo traerlos.
 * <Cargando error={error} onReintentar={recargar} />
 */
export default function Cargando({ error, onReintentar, texto = 'Cargando...' }) {
    if (error) {
        return (
            <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-gray-200">
                <TriangleAlert className="size-8 text-amber-500" aria-hidden="true" />
                <p className="max-w-md text-sm text-gray-600">{error}</p>
                {onReintentar && (
                    <Button variant="ghost" icon={RotateCw} onClick={onReintentar} className="border border-gray-200">
                        Reintentar
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div aria-live="polite" className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
            <LoaderCircle className="size-5 animate-spin text-primary" aria-hidden="true" /> {texto}
        </div>
    );
}
