import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Inbox, Mail, MailOpen, Phone, Search, Trash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import EmptyState from '@/components/admin/EmptyState';
import PageHeader from '@/components/admin/PageHeader';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { formatoFecha } from '@/lib/fechas';
import { cn } from '@/lib/utils';
import { deleteConfirm } from '@/utils/sweetalert';

/** Link de WhatsApp: a celulares peruanos de 9 dígitos se les agrega el 51. */
const whatsappDe = (telefono) => {
    const numero = telefono.replace(/\D/g, '');
    return `https://wa.me/${numero.length === 9 ? `51${numero}` : numero}`;
};

const opcionesVisita = { preserveState: true, preserveScroll: true, replace: true };

export default function MensajesIndex({ mensajes, filtros }) {
    const [buscar, setBuscar] = useState(filtros.buscar);
    const [seleccionadoId, setSeleccionadoId] = useState(null);
    const primeraCarga = useRef(true);

    const seleccionado = mensajes.data.find((m) => m.id === seleccionadoId);

    const filtrar = (cambios) => router.get('/admin/mensajes', { ...filtros, ...cambios }, opcionesVisita);

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
        if (await deleteConfirm('¿Eliminar este mensaje?')) {
            router.delete(`/admin/mensajes/${mensaje.id}`, { preserveScroll: true, onSuccess: () => setSeleccionadoId(null) });
        }
    };

    return (
        <AdminLayout title="Mensajes">
            <PageHeader title="Mensajes" description="Mensajes enviados desde el formulario de contacto del sitio." />

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-gray-200">
                    {[
                        ['todos', 'Todos'],
                        ['no_leidos', 'No leídos'],
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
                        aria-label="Buscar mensajes"
                        placeholder="Buscar nombre, celular, correo..."
                        value={buscar}
                        onChange={(e) => setBuscar(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {mensajes.data.length === 0 ? (
                <EmptyState
                    icon={Inbox}
                    title={filtros.buscar || filtros.estado !== 'todos' ? 'Sin resultados' : 'Aún no hay mensajes'}
                    description="Los mensajes del formulario de contacto aparecerán aquí."
                />
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
                                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                                        <p className={cn('truncate', m.leido_at ? 'text-gray-700' : 'font-bold text-gray-900')}>
                                            {m.nombre}
                                            {!m.leido_at && <span className="sr-only"> (no leído)</span>}
                                        </p>
                                        <span className="shrink-0 text-xs text-gray-400">{formatoFecha(m.created_at)}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {m.telefono}
                                        {m.asunto && ` · ${m.asunto}`}
                                    </p>
                                    <p className="mt-0.5 line-clamp-1 text-sm text-gray-600">{m.mensaje}</p>
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
                title={seleccionado?.nombre}
                description={seleccionado && formatoFecha(seleccionado.created_at)}
                footer={
                    seleccionado && (
                        <>
                            <Button variant="ghost" icon={Trash} onClick={() => eliminar(seleccionado)} className="text-red-600 hover:bg-red-50 sm:mr-auto">
                                Eliminar
                            </Button>
                            <Button variant="ghost" icon={Mail} onClick={() => { marcarLeido(seleccionado, false); setSeleccionadoId(null); }}>
                                Marcar como no leído
                            </Button>
                            <Button href={whatsappDe(seleccionado.telefono)} newTab variant="secondary" icon={FaWhatsapp}>
                                Responder por WhatsApp
                            </Button>
                        </>
                    )
                }
            >
                {seleccionado && (
                    <div className="flex flex-col gap-5">
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
                                    <dt className="text-xs font-semibold text-gray-500 uppercase">Le interesa</dt>
                                    <dd className="font-medium text-gray-900">{seleccionado.asunto}</dd>
                                </div>
                            )}
                        </dl>
                        <div className="rounded-xl bg-gray-50 p-4 text-sm whitespace-pre-line text-gray-800">{seleccionado.mensaje}</div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
