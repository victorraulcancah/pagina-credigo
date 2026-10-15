import { CalendarCheck, Clock, ExternalLink, MapPin, Search, Tags, UsersRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import Cargando from '@/components/admin/Cargando';
import EmptyState from '@/components/admin/EmptyState';
import PageHeader from '@/components/admin/PageHeader';
import Paginacion from '@/components/admin/Paginacion';
import { cercania, estadoReservaUi, HojaFecha, whatsappReserva } from '@/components/admin/reservas/comun';
import ReservaModal from '@/components/admin/reservas/ReservaModal';
import TiposReserva from '@/components/admin/reservas/TiposReserva';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAccionApi } from '@/hooks/useAccionApi';
import { refrescarCompartido } from '@/hooks/useCompartido';
import { useListaFiltrada } from '@/hooks/useListaFiltrada';
import { useSitio } from '@/hooks/useSitio';
import { formatoFecha } from '@/lib/fechas';
import { cn } from '@/lib/utils';
import { deleteConfirm } from '@/utils/sweetalert';

const FILTROS = { buscar: '', estado: 'todos', tipo: 'todos', page: 1 };

const VISTAS = [
    { valor: 'reservas', label: 'Reservas', icono: CalendarCheck },
    { valor: 'tipos', label: 'Qué se puede reservar', icono: Tags },
];

/** Una reserva en la lista: su fecha como hoja de calendario, el cliente, el recorrido y el estado. */
function FilaReserva({ reserva, estados, onAbrir }) {
    const sitio = useSitio();
    const ui = estadoReservaUi(reserva.estado);
    const pronto = cercania(reserva.fecha);

    return (
        <li className={cn('flex items-center gap-2 rounded-2xl border-l-4 bg-white shadow-sm ring-1 ring-gray-200 transition hover:shadow-md', ui.borde)}>
            <button type="button" onClick={onAbrir} className="flex min-w-0 flex-1 items-center gap-4 px-4 py-3.5 text-left sm:px-5">
                <HojaFecha fecha={reserva.fecha} />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-bold text-gray-900">{reserva.nombre}</p>
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', ui.suave)}>{estados[reserva.estado]}</span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">{reserva.tipo}</span>
                        {pronto && reserva.estado !== 'cancelada' && <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">{pronto}</span>}
                    </div>
                    {(reserva.origen || reserva.destino) && (
                        <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-gray-600">
                            <MapPin className="size-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                            <span className="truncate">
                                {reserva.origen} <span className="text-gray-400">→</span> {reserva.destino}
                            </span>
                        </p>
                    )}
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                        {reserva.hora && (
                            <span className="inline-flex items-center gap-1">
                                <Clock className="size-3.5" aria-hidden="true" /> {reserva.hora}
                            </span>
                        )}
                        {reserva.pasajeros && (
                            <span className="inline-flex items-center gap-1">
                                <UsersRound className="size-3.5" aria-hidden="true" /> {reserva.pasajeros}
                            </span>
                        )}
                        <span>{reserva.telefono}</span>
                        <span className="hidden text-gray-400 sm:inline">· recibida {formatoFecha(reserva.created_at)}</span>
                    </p>
                </div>
            </button>
            <a
                href={whatsappReserva(reserva, sitio.empresa_nombre)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Escribir a ${reserva.nombre} por WhatsApp`}
                title="Escribir por WhatsApp"
                className="mr-4 flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#128C7E] transition hover:bg-[#25D366] hover:text-white"
            >
                <FaWhatsapp className="size-5" aria-hidden="true" />
            </a>
        </li>
    );
}

/** Reservas de la web: lista, conteos y opciones llegan de la API (GET /api/admin/reservas). */
export default function ReservasIndex() {
    const [vista, setVista] = useState('reservas');
    const lista = useListaFiltrada('/admin/reservas', FILTROS);
    const { filtros, filtrar, respuesta } = lista;
    const reservas = respuesta?.data ?? [];
    const conteos = respuesta?.conteos ?? {};
    const { estados = {}, tipos = [] } = respuesta?.opciones ?? {};

    const [buscar, setBuscar] = useState(filtros.buscar);
    const [seleccionadaId, setSeleccionadaId] = useState(null);
    const primeraCarga = useRef(true);

    const seleccionada = reservas.find((r) => r.id === seleccionadaId);
    const totalConteos = Object.values(conteos).reduce((suma, n) => suma + n, 0);

    // Tras un cambio: la lista y el contador de pendientes del menú
    const actualizar = () => {
        lista.recargar();
        refrescarCompartido('/admin/contadores');
    };

    // Búsqueda con espera (evita una consulta por cada tecla)
    useEffect(() => {
        if (primeraCarga.current) {
            primeraCarga.current = false;
            return;
        }
        const id = setTimeout(() => filtrar({ buscar }), 400);
        return () => clearTimeout(id);
    }, [buscar]);

    const { ejecutar } = useAccionApi(actualizar);

    const eliminar = async (reserva) => {
        if (await deleteConfirm('¿Eliminar esta reserva?')) {
            const { success } = await ejecutar('delete', `/admin/reservas/${reserva.id}`);
            if (success) setSeleccionadaId(null);
        }
    };

    const pestanas = [['todos', 'Todas', totalConteos], ...Object.entries(estados).map(([valor, label]) => [valor, label, conteos[valor] ?? 0])];

    return (
        <AdminLayout title="Reservas">
            <PageHeader
                title="Reservas"
                description="Lo que reservan los clientes desde la web. Confírmales por WhatsApp y marca el estado de cada reserva."
                actions={
                    <Button href="/reservar" nativo newTab variant="ghost" icon={ExternalLink} className="border border-gray-200 bg-white">
                        Ver formulario
                    </Button>
                }
            />

            <div className="mb-4 inline-flex rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-gray-200">
                {VISTAS.map((v) => (
                    <button
                        key={v.valor}
                        type="button"
                        onClick={() => setVista(v.valor)}
                        aria-pressed={vista === v.valor}
                        className={cn(
                            'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition',
                            vista === v.valor ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100',
                        )}
                    >
                        <v.icono className="size-4" aria-hidden="true" /> {v.label}
                    </button>
                ))}
            </div>

            {vista === 'tipos' ? (
                <TiposReserva alCambiar={lista.recargar} />
            ) : (
                <>
                    {/* Estados, cada uno con su color */}
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
                                    {valor !== 'todos' && <span className={cn('size-2.5 rounded-full', estadoReservaUi(valor).punto)} />}
                                    {label}
                                    <span className={cn('rounded-full px-2 py-0.5 text-xs', activa ? 'bg-white/20' : 'bg-gray-100')}>{total}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mb-4 grid gap-3 sm:grid-cols-3">
                        <div className="relative sm:col-span-2">
                            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                            <Input type="search" aria-label="Buscar" placeholder="Nombre, celular, origen o destino" value={buscar} onChange={(e) => setBuscar(e.target.value)} className="pl-10" />
                        </div>
                        <Select
                            aria-label="Tipo"
                            value={filtros.tipo}
                            onChange={(e) => filtrar({ tipo: e.target.value })}
                            options={[{ value: 'todos', label: 'Todos los tipos' }, ...tipos.map((t) => ({ value: String(t.id), label: t.nombre }))]}
                        />
                    </div>

                    {!respuesta ? (
                        <Cargando error={lista.error} onReintentar={lista.recargar} />
                    ) : reservas.length === 0 ? (
                        <EmptyState icon={CalendarCheck} title="No hay reservas con estos filtros" description="Las reservas del formulario de la web (/reservar) aparecerán aquí." />
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {reservas.map((reserva) => (
                                <FilaReserva key={reserva.id} reserva={reserva} estados={estados} onAbrir={() => setSeleccionadaId(reserva.id)} />
                            ))}
                        </ul>
                    )}

                    <Paginacion paginacion={respuesta?.pagination} onPagina={(pagina) => filtrar({ page: pagina })} />
                </>
            )}

            <ReservaModal reserva={seleccionada} estados={estados} recargar={actualizar} onClose={() => setSeleccionadaId(null)} onEliminar={eliminar} />
        </AdminLayout>
    );
}
