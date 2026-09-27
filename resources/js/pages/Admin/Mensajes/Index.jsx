import { router, useForm } from '@inertiajs/react';
import { Calculator, ChevronLeft, ChevronRight, FileSpreadsheet, Inbox, Mail, MailOpen, Phone, Save, Search, Trash, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import EmptyState from '@/components/admin/EmptyState';
import PageHeader from '@/components/admin/PageHeader';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { formatoFecha } from '@/lib/fechas';
import { cn } from '@/lib/utils';
import { deleteConfirm } from '@/utils/sweetalert';

/** Colores de cada etapa del seguimiento. */
const COLOR_ESTADO = {
    nuevo: 'bg-accent-100 text-accent-900',
    contactado: 'bg-sky-100 text-sky-800',
    inscrito: 'bg-green-100 text-green-800',
    descartado: 'bg-gray-100 text-gray-500',
};

/** Link de WhatsApp: a celulares peruanos de 9 dígitos se les agrega el 51. */
const whatsappDe = (telefono) => {
    const numero = telefono.replace(/\D/g, '');
    return `https://wa.me/${numero.length === 9 ? `51${numero}` : numero}`;
};

const opcionesVisita = { preserveState: true, preserveScroll: true, replace: true };

function EstadoBadge({ estado, estados }) {
    return <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', COLOR_ESTADO[estado])}>{estados[estado] ?? estado}</span>;
}

export default function MensajesIndex({ mensajes, filtros, conteos, estados, origenes, usuarios }) {
    const [buscar, setBuscar] = useState(filtros.buscar);
    const [seleccionadoId, setSeleccionadoId] = useState(null);
    const primeraCarga = useRef(true);
    const seguimiento = useForm({ estado: 'nuevo', asignado_a: '', notas: '' });

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
        seguimiento.setData({ estado: mensaje.estado, asignado_a: mensaje.asignado_a ?? '', notas: mensaje.notas ?? '' });
        seguimiento.clearErrors();
        if (!mensaje.leido_at) marcarLeido(mensaje, true);
    };

    const guardarSeguimiento = (e) => {
        e.preventDefault();
        seguimiento.put(`/admin/mensajes/${seleccionado.id}/seguimiento`, { preserveScroll: true, preserveState: true });
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
                    <Button href={urlExportar} nativo variant="ghost" icon={FileSpreadsheet} className="border border-gray-200">
                        Exportar a Excel
                    </Button>
                }
            />

            {/* Etapas del seguimiento */}
            <div className="mb-4 flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 ring-1 ring-gray-200">
                {pestanas.map(([valor, label, total]) => (
                    <button
                        key={valor}
                        type="button"
                        onClick={() => filtrar({ estado: valor })}
                        className={cn(
                            'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition',
                            filtros.estado === valor ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100',
                        )}
                    >
                        {label}
                        <span className={cn('rounded-full px-2 py-0.5 text-xs', filtros.estado === valor ? 'bg-white/20' : 'bg-gray-100')}>{total}</span>
                    </button>
                ))}
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
                <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
                    {mensajes.data.map((m) => (
                        <li key={m.id}>
                            <button
                                type="button"
                                onClick={() => abrir(m)}
                                className={cn('flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-gray-50 sm:px-5', !m.leido_at && 'bg-accent-50')}
                            >
                                <span className={cn('mt-2 size-2 shrink-0 rounded-full', m.leido_at ? 'bg-transparent' : 'bg-primary')} aria-hidden="true" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className={cn('truncate', m.leido_at ? 'text-gray-800' : 'font-bold text-gray-900')}>
                                            {m.nombre}
                                            {!m.leido_at && <span className="sr-only"> (no leído)</span>}
                                        </p>
                                        <EstadoBadge estado={m.estado} estados={estados} />
                                        {m.origen === 'cotizador' && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary">
                                                <Calculator className="size-3" aria-hidden="true" /> Cotizador
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {m.telefono}
                                        {m.asunto && ` · ${m.asunto}`}
                                    </p>
                                    <p className="mt-0.5 line-clamp-1 text-sm text-gray-600">{m.mensaje}</p>
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-gray-400">
                                    <span>{formatoFecha(m.created_at)}</span>
                                    <span className="inline-flex items-center gap-1">
                                        <UserRound className="size-3.5" aria-hidden="true" />
                                        {m.asignado?.name ?? 'Sin asignar'}
                                    </span>
                                </div>
                            </button>
                        </li>
                    ))}
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

            <Modal
                open={Boolean(seleccionado)}
                onClose={() => setSeleccionadoId(null)}
                maxWidth="max-w-3xl"
                title={seleccionado?.nombre}
                description={seleccionado && `${formatoFecha(seleccionado.created_at)} · ${origenes[seleccionado.origen] ?? ''}`}
                footer={
                    seleccionado && (
                        <>
                            <Button variant="ghost" icon={Trash} onClick={() => eliminar(seleccionado)} className="text-red-600 hover:bg-red-50 sm:mr-auto">
                                Eliminar
                            </Button>
                            <Button variant="ghost" icon={Mail} onClick={() => { marcarLeido(seleccionado, false); setSeleccionadoId(null); }}>
                                Marcar como no leído
                            </Button>
                            <Button href={whatsappDe(seleccionado.telefono)} newTab variant="outline" icon={FaWhatsapp}>
                                WhatsApp
                            </Button>
                            <Button type="submit" form="form-seguimiento" variant="secondary" icon={Save} disabled={seguimiento.processing}>
                                Guardar seguimiento
                            </Button>
                        </>
                    )
                }
            >
                {seleccionado && (
                    <div className="grid gap-6 lg:grid-cols-5">
                        <div className="flex flex-col gap-4 lg:col-span-3">
                            <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                <div>
                                    <dt className="text-xs font-semibold text-gray-500 uppercase">Celular</dt>
                                    <dd>
                                        <a href={`tel:${seleccionado.telefono.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
                                            <Phone className="size-4" aria-hidden="true" /> {seleccionado.telefono}
                                        </a>
                                    </dd>
                                </div>
                                {seleccionado.email && (
                                    <div>
                                        <dt className="text-xs font-semibold text-gray-500 uppercase">Correo</dt>
                                        <dd>
                                            <a href={`mailto:${seleccionado.email}`} className="inline-flex items-center gap-1.5 font-medium break-all text-primary hover:underline">
                                                <MailOpen className="size-4 shrink-0" aria-hidden="true" /> {seleccionado.email}
                                            </a>
                                        </dd>
                                    </div>
                                )}
                                {seleccionado.asunto && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-xs font-semibold text-gray-500 uppercase">Asunto</dt>
                                        <dd className="font-medium text-gray-900">{seleccionado.asunto}</dd>
                                    </div>
                                )}
                            </dl>
                            <div className="rounded-xl bg-gray-50 p-4 text-sm whitespace-pre-line text-gray-800">{seleccionado.mensaje}</div>
                        </div>

                        <form id="form-seguimiento" onSubmit={guardarSeguimiento} className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 lg:col-span-2">
                            <p className="text-sm font-bold text-gray-900">Seguimiento</p>
                            <FormField label="Estado" htmlFor="estado" error={seguimiento.errors.estado}>
                                <Select
                                    id="estado"
                                    value={seguimiento.data.estado}
                                    onChange={(e) => seguimiento.setData('estado', e.target.value)}
                                    options={Object.entries(estados).map(([value, label]) => ({ value, label }))}
                                />
                            </FormField>
                            <FormField label="Asesor asignado" htmlFor="asignado_a" error={seguimiento.errors.asignado_a}>
                                <Select
                                    id="asignado_a"
                                    value={seguimiento.data.asignado_a}
                                    onChange={(e) => seguimiento.setData('asignado_a', e.target.value)}
                                    placeholder="Sin asignar"
                                    options={usuarios.map((u) => ({ value: u.id, label: u.name }))}
                                />
                            </FormField>
                            <FormField label="Notas internas" htmlFor="notas" error={seguimiento.errors.notas} hint="Solo las ve el equipo.">
                                <Textarea
                                    id="notas"
                                    rows={4}
                                    value={seguimiento.data.notas}
                                    onChange={(e) => seguimiento.setData('notas', e.target.value)}
                                    placeholder="Ej. Llamé el lunes, pidió la cuota del plan 15k"
                                />
                            </FormField>
                        </form>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
