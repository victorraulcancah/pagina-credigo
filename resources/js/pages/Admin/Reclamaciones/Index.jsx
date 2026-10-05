import { BookOpenText, Paperclip, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Cargando from '@/components/admin/Cargando';
import EmptyState from '@/components/admin/EmptyState';
import PageHeader from '@/components/admin/PageHeader';
import Paginacion from '@/components/admin/Paginacion';
import Plazo from '@/components/admin/reclamaciones/Plazo';
import ReclamacionModal from '@/components/admin/reclamaciones/ReclamacionModal';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { refrescarCompartido } from '@/hooks/useCompartido';
import { useListaFiltrada } from '@/hooks/useListaFiltrada';
import { formatoFecha } from '@/lib/fechas';
import { cn } from '@/lib/utils';

const FILTROS = { buscar: '', estado: 'todos', page: 1 };

/** Bandeja del Libro de Reclamaciones: las hojas llegan de la API (GET /api/admin/reclamaciones). */
export default function ReclamacionesIndex() {
    const lista = useListaFiltrada('/admin/reclamaciones', FILTROS);
    const { filtros, filtrar } = lista;
    const reclamaciones = lista.respuesta?.data ?? [];
    const diasRespuesta = lista.respuesta?.opciones?.dias_respuesta ?? 15;

    const [buscar, setBuscar] = useState(filtros.buscar);
    const [seleccionadaId, setSeleccionadaId] = useState(null);
    const primeraCarga = useRef(true);

    const seleccionada = reclamaciones.find((r) => r.id === seleccionadaId);

    // Tras responder: la lista y el contador de pendientes del menú
    const actualizar = () => {
        lista.recargar();
        refrescarCompartido('/admin/contadores');
    };

    useEffect(() => {
        if (primeraCarga.current) {
            primeraCarga.current = false;
            return;
        }
        const id = setTimeout(() => filtrar({ buscar }), 400);
        return () => clearTimeout(id);
    }, [buscar]);

    const abrir = (reclamacion) => setSeleccionadaId(reclamacion.id);

    return (
        <AdminLayout title="Libro de Reclamaciones">
            <PageHeader
                title="Libro de Reclamaciones"
                description={`Hojas registradas en la web. Plazo legal de respuesta: ${diasRespuesta} días hábiles. No se pueden eliminar.`}
                actions={
                    <Button href="/libro-de-reclamaciones" newTab variant="ghost" icon={BookOpenText} className="border border-gray-200">
                        Ver formulario público
                    </Button>
                }
            />

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex w-fit rounded-full bg-white p-1 ring-1 ring-gray-200">
                    {[
                        ['todos', 'Todas'],
                        ['pendiente', 'Pendientes'],
                        ['atendido', 'Atendidas'],
                    ].map(([valor, label]) => (
                        <button
                            key={valor}
                            type="button"
                            onClick={() => filtrar({ estado: valor })}
                            className={cn(
                                'rounded-full px-4 py-1.5 text-sm font-semibold transition',
                                filtros.estado === valor ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900',
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className="relative sm:w-72">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <Input
                        type="search"
                        aria-label="Buscar reclamaciones"
                        placeholder="N° de hoja, nombre o documento"
                        value={buscar}
                        onChange={(e) => setBuscar(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {!lista.respuesta ? (
                <Cargando error={lista.error} onReintentar={lista.recargar} />
            ) : reclamaciones.length === 0 ? (
                <EmptyState
                    icon={BookOpenText}
                    title={filtros.buscar || filtros.estado !== 'todos' ? 'Sin resultados' : 'No hay reclamaciones'}
                    description="Las hojas del Libro de Reclamaciones de la web aparecerán aquí."
                />
            ) : (
                <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
                    {reclamaciones.map((r) => (
                        <li key={r.id}>
                            <button type="button" onClick={() => abrir(r)} className="flex w-full flex-col gap-2 px-4 py-4 text-left transition hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-sm font-bold text-gray-900">N° {r.codigo}</span>
                                        <span
                                            className={cn(
                                                'rounded-full px-2 py-0.5 text-xs font-bold uppercase',
                                                r.tipo === 'reclamo' ? 'bg-primary-50 text-primary' : 'bg-accent-100 text-accent-900',
                                            )}
                                        >
                                            {r.tipo}
                                        </span>
                                        {r.adjuntos?.length > 0 && (
                                            <span className="inline-flex items-center gap-1 text-xs text-gray-500" title="Archivos adjuntos">
                                                <Paperclip className="size-3.5" aria-hidden="true" /> {r.adjuntos.length}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-0.5 truncate text-sm text-gray-700">
                                        {r.nombre} · {r.tipo_documento} {r.numero_documento}
                                    </p>
                                    <p className="line-clamp-1 text-sm text-gray-500">{r.detalle}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                                    <Plazo reclamacion={r} />
                                    <span className="text-xs text-gray-400">{formatoFecha(r.created_at)}</span>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <Paginacion paginacion={lista.respuesta?.pagination} onPagina={(pagina) => filtrar({ page: pagina })} />

            <ReclamacionModal reclamacion={seleccionada} onClose={() => setSeleccionadaId(null)} recargar={actualizar} />
        </AdminLayout>
    );
}
