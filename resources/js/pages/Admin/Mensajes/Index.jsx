import { router } from '@inertiajs/react';
import { Calculator, ChevronLeft, ChevronRight, FileSpreadsheet, Inbox, Search, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import EmptyState from '@/components/admin/EmptyState';
import PageHeader from '@/components/admin/PageHeader';
import { estadoUi, iniciales } from '@/components/admin/solicitudes/estados';
import SolicitudModal from '@/components/admin/solicitudes/SolicitudModal';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { formatoFecha } from '@/lib/fechas';
import { cn } from '@/lib/utils';
import { deleteConfirm } from '@/utils/sweetalert';

const opcionesVisita = { preserveState: true, preserveScroll: true, replace: true };

export default function MensajesIndex({ mensajes, filtros, conteos, estados, origenes, usuarios }) {
    const [buscar, setBuscar] = useState(filtros.buscar);
    const [seleccionadoId, setSeleccionadoId] = useState(null);
    const primeraCarga = useRef(true);

    const seleccionado = mensajes.data.find((m) => m.id === seleccionadoId);
    const totalConteos = Object.values(conteos).reduce((suma, n) => suma + n, 0);

    const filtrar = (cambios) => router.get('/admin/mensajes', { ...filtros, ...cambios }, opcionesVisita);
    const urlExportar = `/admin/mensajes/exportar?${new URLSearchParams(filtros).toString()}`;

    // Búsqueda con espera (evita una consulta por cada tecla)
    useEffect(() => {
        if (primeraCarga.current) {
            primeraCarga.current = false;
            return;
        }
        const id = setTimeout(() => filtrar({ buscar }), 400);
        return () => clearTimeout(id);
    }, [buscar]);

    const marcarLeido = (mensaje, leido) =>
        router.patch(`/admin/mensajes/${mensaje.id}/leido`, { leido }, { preserveState: true, preserveScroll: true });

    const abrir = (mensaje) => {
        setSeleccionadoId(mensaje.id);
        if (!mensaje.leido_at) marcarLeido(mensaje, true);
    };

    const eliminar = async (mensaje) => {
        if (await deleteConfirm('¿Eliminar esta solicitud?')) {
            router.delete(`/admin/mensajes/${mensaje.id}`, { preserveScroll: true, onSuccess: () => setSeleccionadoId(null) });
        }
    };

    const pestanas = [['todos', 'Todas', totalConteos], ...Object.entries(estados).map(([valor, label]) => [valor, label, conteos[valor] ?? 0])];

    return (
        <AdminLayout title="Solicitudes">
            <PageHeader
                title="Solicitudes"
                description="Mensajes del formulario de contacto y del cotizador. Asigna un asesor y registra el avance de cada cliente."
                actions={
                    <Button href={urlExportar} nativo variant="ghost" icon={FileSpreadsheet} className="border border-gray-200 bg-white">
                        Exportar a Excel
                    </Button>
                }
            />

            {/* Etapas del seguimiento, cada una con su color */}
            <div className="mb-4 flex gap-1 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-gray-200">
                {pestanas.map(([valor, label, total]) => {
                    const activa = filtros.estado === valor;
                    return (
                        <button
                            key={valor}
                            type="button"
                            onClick={() => filtrar({ estado: valor })}
                            className={cn(
                                'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition',
                                activa ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100',
                            )}
                        >
                            {valor !== 'todos' && <span className={cn('size-2.5 rounded-full', estadoUi(valor).punto)} />}
                            {label}
                            <span className={cn('rounded-full px-2 py-0.5 text-xs', activa ? 'bg-white/20' : 'bg-gray-100')}>{total}</span>
                        </button>
                    );
                })}
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <Input type="search" aria-label="Buscar" placeholder="Nombre, celular, correo o asunto" value={buscar} onChange={(e) => setBuscar(e.target.value)} className="pl-10" />
                </div>
                <Select
                    aria-label="Asesor"
                    value={filtros.asignado}
                    onChange={(e) => filtrar({ asignado: e.target.value })}
                    options={[
                        { value: 'todos', label: 'Todos los asesores' },
                        { value: 'mios', label: 'Asignadas a mí' },
                        { value: 'sin_asignar', label: 'Sin asignar' },
                    ]}
                />
                <Select
                    aria-label="Origen"
                    value={filtros.origen}
                    onChange={(e) => filtrar({ origen: e.target.value })}
                    options={[{ value: 'todos', label: 'Todos los orígenes' }, ...Object.entries(origenes).map(([value, label]) => ({ value, label }))]}
                />
            </div>

            {mensajes.data.length === 0 ? (
                <EmptyState icon={Inbox} title="No hay solicitudes con estos filtros" description="Las solicitudes del formulario de contacto y del cotizador aparecerán aquí." />
            ) : (
                <ul className="flex flex-col gap-2">
                    {mensajes.data.map((m) => {
                        const ui = estadoUi(m.estado);
                        const noLeido = !m.leido_at;
                        return (
                            <li key={m.id}>
                                <button
                                    type="button"
                                    onClick={() => abrir(m)}
                                    className={cn(
                                        'flex w-full items-center gap-4 rounded-2xl border-l-4 bg-white px-4 py-3.5 text-left shadow-sm ring-1 ring-gray-200 transition hover:shadow-md sm:px-5',
                                        ui.borde,
                                    )}
                                >
                                    <span className="relative shrink-0">
                                        <span className={cn('flex size-11 items-center justify-center rounded-full text-sm font-bold', ui.suave)}>{iniciales(m.nombre_completo)}</span>
                                        {noLeido && <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-primary ring-2 ring-white" title="No leído" />}
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className={cn('truncate', noLeido ? 'font-bold text-gray-900' : 'font-medium text-gray-800')}>
                                                {m.nombre_completo}
                                                {noLeido && <span className="sr-only"> (no leído)</span>}
                                            </p>
                                            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', ui.suave)}>{estados[m.estado]}</span>
                                            {m.origen === 'cotizador' && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary">
                                                    <Calculator className="size-3" aria-hidden="true" /> Cotizador
                                                </span>
                                            )}
                                            {m.tipo_consulta_texto && (
                                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">{m.tipo_consulta_texto}</span>
                                            )}
                                        </div>
                                        <p className="mt-0.5 truncate text-sm text-gray-500">
                                            {m.telefono}
                                            {m.asunto && ` · ${m.asunto}`}
                                        </p>
                                    </div>

                                    <div className="hidden shrink-0 flex-col items-end gap-1 text-xs text-gray-400 sm:flex">
                                        <span>{formatoFecha(m.created_at)}</span>
                                        <span className="inline-flex items-center gap-1">
                                            <UserRound className="size-3.5" aria-hidden="true" />
                                            {m.asignado?.name ?? 'Sin asignar'}
                                        </span>
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}

            {mensajes.last_page > 1 && (
                <nav aria-label="Paginación" className="mt-4 flex items-center justify-between gap-3 text-sm">
                    <span className="text-gray-500">
                        {mensajes.from}–{mensajes.to} de {mensajes.total}
                    </span>
                    <div className="flex gap-2">
                        <Button href={mensajes.prev_page_url ?? undefined} variant="ghost" size="sm" icon={ChevronLeft} disabled={!mensajes.prev_page_url} className="border border-gray-200" preserveState>
                            Anterior
                        </Button>
                        <Button href={mensajes.next_page_url ?? undefined} variant="ghost" size="sm" icon={ChevronRight} iconPosition="right" disabled={!mensajes.next_page_url} className="border border-gray-200" preserveState>
                            Siguiente
                        </Button>
                    </div>
                </nav>
            )}

            <SolicitudModal
                mensaje={seleccionado}
                estados={estados}
                origenes={origenes}
                usuarios={usuarios}
                onClose={() => setSeleccionadoId(null)}
                onMarcarNoLeido={(mensaje) => {
                    marcarLeido(mensaje, false);
                    setSeleccionadoId(null);
                }}
                onEliminar={eliminar}
            />
        </AdminLayout>
    );
}
