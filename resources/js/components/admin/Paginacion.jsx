import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';

/**
 * Paginación de una lista de la API: { current_page, last_page, per_page, total }.
 * <Paginacion paginacion={respuesta.pagination} onPagina={(page) => filtrar({ page })} />
 */
export default function Paginacion({ paginacion, onPagina }) {
    if (!paginacion || paginacion.last_page <= 1) return null;

    const { current_page: actual, last_page: ultima, per_page: porPagina, total } = paginacion;
    const desde = (actual - 1) * porPagina + 1;
    const hasta = Math.min(actual * porPagina, total);

    return (
        <nav aria-label="Paginación" className="mt-4 flex items-center justify-between gap-3 text-sm">
            <span className="text-gray-500 tabular-nums">
                {desde}–{hasta} de {total}
            </span>
            <div className="flex gap-2">
                <Button onClick={() => onPagina(actual - 1)} variant="ghost" size="sm" icon={ChevronLeft} disabled={actual <= 1} className="border border-gray-200">
                    Anterior
                </Button>
                <Button
                    onClick={() => onPagina(actual + 1)}
                    variant="ghost"
                    size="sm"
                    icon={ChevronRight}
                    iconPosition="right"
                    disabled={actual >= ultima}
                    className="border border-gray-200"
                >
                    Siguiente
                </Button>
            </div>
        </nav>
    );
}
