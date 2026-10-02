import { router } from '@inertiajs/react';
import { BookOpenText, FileText, Paperclip, Search, Send, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Cargando from '@/components/admin/Cargando';
import EmptyState from '@/components/admin/EmptyState';
import PageHeader from '@/components/admin/PageHeader';
import Paginacion from '@/components/admin/Paginacion';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import { useFormApi } from '@/hooks/useFormApi';
import { useListaFiltrada } from '@/hooks/useListaFiltrada';
import { formatoFecha } from '@/lib/fechas';
import { ETIQUETA_ADJUNTO, filasHoja, tamanoArchivo } from '@/lib/reclamacion';
import { cn } from '@/lib/utils';

const FILTROS = { buscar: '', estado: 'todos', page: 1 };

// fecha_limite viene como "2026-10-17": se lee a mediodía para evitar desfases de zona horaria
const fechaLocal = (fecha) => new Date(`${fecha}T12:00:00`);
const diasRestantes = (fecha) => Math.ceil((fechaLocal(fecha) - new Date().setHours(12, 0, 0, 0)) / 86_400_000);

function Plazo({ reclamacion }) {
    if (reclamacion.estado === 'atendido') {
        return <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">Atendido</span>;
    }

    const dias = diasRestantes(reclamacion.fecha_limite);

    return (
        <span
            className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                reclamacion.vencido ? 'bg-red-100 text-red-700' : dias <= 3 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600',
            )}
        >
            {reclamacion.vencido ? 'Plazo vencido' : `Vence ${formatoFecha(fechaLocal(reclamacion.fecha_limite), false)}`}
        </span>
    );
}

function Dato({ etiqueta, children, className }) {
    if (!children) return null;

    return (
        <div className={className}>
            <dt className="text-xs font-semibold text-gray-500 uppercase">{etiqueta}</dt>
            <dd className="mt-0.5 whitespace-pre-line text-gray-900">{children}</dd>
        </div>
    );
}

/** Bandeja del Libro de Reclamaciones: las hojas llegan de la API (GET /api/admin/reclamaciones). */
export default function ReclamacionesIndex() {
    const lista = useListaFiltrada('/admin/reclamaciones', FILTROS);
    const { filtros, filtrar } = lista;
    const reclamaciones = lista.respuesta?.data ?? [];
    const diasRespuesta = lista.respuesta?.opciones?.dias_respuesta ?? 15;

    const [buscar, setBuscar] = useState(filtros.buscar);
    const [seleccionadaId, setSeleccionadaId] = useState(null);
    const primeraCarga = useRef(true);
    const respuesta = useFormApi({ respuesta: '' });

    const seleccionada = reclamaciones.find((r) => r.id === seleccionadaId);

    // Tras responder: la lista y el contador de pendientes del menú
    const actualizar = () => {
        lista.recargar();
        router.reload({ only: ['reclamacionesPendientes'] });
    };

    useEffect(() => {
        if (primeraCarga.current) {
            primeraCarga.current = false;
            return;
        }
        const id = setTimeout(() => filtrar({ buscar }), 400);
        return () => clearTimeout(id);
    }, [buscar]);

    const abrir = (reclamacion) => {
        respuesta.reset();
        respuesta.clearErrors();
        setSeleccionadaId(reclamacion.id);
    };

    const responder = (e) => {
        e.preventDefault();
        respuesta.put(`/admin/reclamaciones/${seleccionada.id}/respuesta`, { recargar: actualizar });
    };

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

            <Modal
                open={Boolean(seleccionada)}
                onClose={() => setSeleccionadaId(null)}
                maxWidth="max-w-3xl"
                title={seleccionada && `Hoja N° ${seleccionada.codigo} · ${seleccionada.tipo === 'reclamo' ? 'Reclamo' : 'Queja'}`}
                description={seleccionada && `Registrada el ${formatoFecha(seleccionada.created_at)}`}
                footer={
                    seleccionada?.estado === 'pendiente' && (
                        <Button type="submit" form="form-respuesta" variant="secondary" icon={Send} disabled={respuesta.processing}>
                            {respuesta.processing ? 'Enviando...' : 'Registrar respuesta y enviar por correo'}
                        </Button>
                    )
                }
            >
                {seleccionada && (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-wrap items-center gap-2">
                            <Plazo reclamacion={seleccionada} />
                        </div>
                        <dl className="grid gap-4 text-sm sm:grid-cols-2">
                            {filasHoja(seleccionada).map(([etiqueta, valor]) => (
                                <Dato key={etiqueta} etiqueta={etiqueta} className={valor.length > 60 ? 'sm:col-span-2' : undefined}>
                                    {valor}
                                </Dato>
                            ))}
                        </dl>

                        {seleccionada.adjuntos?.length > 0 && (
                            <div>
                                <p className="mb-2 text-xs font-semibold text-gray-500 uppercase">Archivos adjuntos</p>
                                <ul className="grid gap-2 sm:grid-cols-2">
                                    {seleccionada.adjuntos.map((adjunto) => {
                                        const url = `/api/admin/reclamaciones/adjuntos/${adjunto.id}`;
                                        return (
                                            <li key={adjunto.id}>
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 rounded-xl border border-gray-200 p-2 transition hover:border-primary"
                                                >
                                                    {adjunto.mime.startsWith('image/') ? (
                                                        <img src={url} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
                                                    ) : (
                                                        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                                            {adjunto.tipo === 'video' ? <Video className="size-5" /> : <FileText className="size-5" />}
                                                        </span>
                                                    )}
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-sm font-medium text-gray-900">{adjunto.nombre_original}</span>
                                                        <span className="block text-xs text-gray-500">
                                                            {ETIQUETA_ADJUNTO[adjunto.tipo]} · {tamanoArchivo(adjunto.tamano)}
                                                        </span>
                                                    </span>
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {seleccionada.estado === 'atendido' ? (
                            <div className="rounded-xl bg-green-50 p-4 text-sm">
                                <p className="font-semibold text-green-800">
                                    Respondido el {formatoFecha(seleccionada.respondido_at)}
                                    {seleccionada.respondido_por?.name && ` por ${seleccionada.respondido_por.name}`}
                                </p>
                                <p className="mt-2 whitespace-pre-line text-gray-800">{seleccionada.respuesta}</p>
                            </div>
                        ) : (
                            <form id="form-respuesta" onSubmit={responder}>
                                <FormField
                                    label="Respuesta al consumidor"
                                    htmlFor="respuesta"
                                    error={respuesta.errors.respuesta}
                                    hint={`Se enviará a ${seleccionada.email} y quedará registrada en la hoja.`}
                                >
                                    <Textarea
                                        id="respuesta"
                                        rows={6}
                                        value={respuesta.data.respuesta}
                                        onChange={(e) => respuesta.setData('respuesta', e.target.value)}
                                        error={respuesta.errors.respuesta}
                                    />
                                </FormField>
                            </form>
                        )}
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
