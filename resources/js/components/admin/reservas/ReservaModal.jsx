import { CircleCheckBig, MessageSquareText, Phone, Save, Trash } from 'lucide-react';
import { useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { DatoContacto, Tarjeta } from '@/components/admin/Detalle';
import { cercania, estadoReservaUi, fechaLarga, HojaFecha, whatsappReserva } from '@/components/admin/reservas/comun';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import { useFormApi } from '@/hooks/useFormApi';
import { useSitio } from '@/hooks/useSitio';
import { formatoFecha } from '@/lib/fechas';
import { cn } from '@/lib/utils';

/** Recorrido de la reserva: desde → hasta, unidos por una línea punteada. */
function Recorrido({ origen, destino }) {
    return (
        <div className="relative grid gap-4 pl-7">
            <span aria-hidden="true" className="absolute top-2.5 bottom-2.5 left-[0.3rem] border-l-2 border-dotted border-gray-300" />
            <div className="relative">
                <span aria-hidden="true" className="absolute top-1.5 -left-7 size-3 rounded-full bg-accent ring-4 ring-accent/30" />
                <p className="text-xs text-gray-500">Desde</p>
                <p className="font-semibold text-gray-900">{origen}</p>
            </div>
            <div className="relative">
                <span aria-hidden="true" className="absolute top-1.5 -left-7 size-3 rounded-[3px] bg-primary ring-4 ring-primary/15" />
                <p className="text-xs text-gray-500">Hasta</p>
                <p className="font-semibold text-gray-900">{destino}</p>
            </div>
        </div>
    );
}

/** Detalle de una reserva: datos, contacto con el cliente y su estado con notas internas. */
export default function ReservaModal({ reserva, estados, recargar, onClose, onEliminar }) {
    const sitio = useSitio();
    const form = useFormApi({ estado: 'pendiente', notas: '' });
    const { data, setData, errors, processing, recentlySuccessful } = form;

    // Al abrir otra reserva, el formulario toma sus datos
    useEffect(() => {
        if (!reserva) return;
        const valores = { estado: reserva.estado, notas: reserva.notas ?? '' };
        form.setData(valores);
        form.setDefaults(valores);
        form.clearErrors();
    }, [reserva?.id]);

    const guardar = (e) => {
        e.preventDefault();
        form.put(`/admin/reservas/${reserva.id}`, { recargar, onSuccess: () => form.setDefaults() });
    };

    const ui = reserva ? estadoReservaUi(reserva.estado) : null;
    const pronto = reserva ? cercania(reserva.fecha) : null;

    return (
        <Modal
            open={Boolean(reserva)}
            onClose={onClose}
            maxWidth="max-w-4xl"
            bodyClassName="bg-gray-50"
            header={
                reserva && (
                    <div className="bg-primary px-5 py-5 text-white sm:px-6">
                        <div className="flex items-center gap-4 pr-10">
                            <HojaFecha fecha={reserva.fecha} oscura />
                            <div className="min-w-0">
                                <h2 className="truncate text-xl font-bold">{reserva.nombre}</h2>
                                <p className="text-sm text-primary-200 first-letter:uppercase">
                                    {fechaLarga(reserva.fecha)}
                                    {reserva.hora && `, ${reserva.hora}`}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                                    <span className={cn('rounded-full px-2.5 py-1', ui.solido)}>{estados[reserva.estado]}</span>
                                    <span className="rounded-full bg-white/15 px-2.5 py-1">{reserva.tipo}</span>
                                    {pronto && <span className="rounded-full bg-white px-2.5 py-1 text-primary">{pronto}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            footer={
                reserva && (
                    <>
                        <Button variant="ghost" size="sm" icon={Trash} onClick={() => onEliminar(reserva)} className="border border-red-200 text-red-600 hover:bg-red-50 sm:mr-auto">
                            Eliminar
                        </Button>
                        <p className="text-xs text-gray-400">Recibida el {formatoFecha(reserva.created_at)}</p>
                    </>
                )
            }
        >
            {reserva && (
                <div className="grid gap-5 lg:grid-cols-5">
                    <div className="flex flex-col gap-5 lg:col-span-3">
                        <Tarjeta titulo="Cliente">
                            <DatoContacto icono={Phone} etiqueta="Celular">
                                {reserva.telefono}
                            </DatoContacto>
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                <a
                                    href={whatsappReserva(reserva, sitio.empresa_nombre)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
                                >
                                    <FaWhatsapp className="size-4" aria-hidden="true" /> Confirmar por WhatsApp
                                </a>
                                <a
                                    href={`tel:${reserva.telefono.replace(/\s/g, '')}`}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800"
                                >
                                    <Phone className="size-4" aria-hidden="true" /> Llamar
                                </a>
                            </div>
                        </Tarjeta>

                        <Tarjeta titulo="Reserva">
                            <div className="flex flex-col gap-5">
                                {(reserva.origen || reserva.destino) && <Recorrido origen={reserva.origen} destino={reserva.destino} />}
                                <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                                    <div>
                                        <dt className="text-xs text-gray-500">Fecha</dt>
                                        <dd className="font-semibold text-gray-900 first-letter:uppercase">{fechaLarga(reserva.fecha)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-gray-500">Hora</dt>
                                        <dd className="font-semibold text-gray-900">{reserva.hora || 'Sin hora'}</dd>
                                    </div>
                                    {reserva.pasajeros && (
                                        <div>
                                            <dt className="text-xs text-gray-500">Pasajeros</dt>
                                            <dd className="font-semibold text-gray-900">{reserva.pasajeros}</dd>
                                        </div>
                                    )}
                                </dl>
                                {reserva.comentario && (
                                    <div className="flex gap-3 rounded-xl bg-gray-50 p-3 text-sm">
                                        <MessageSquareText className="mt-0.5 size-4 shrink-0 text-gray-400" aria-hidden="true" />
                                        <p className="whitespace-pre-line text-gray-800">{reserva.comentario}</p>
                                    </div>
                                )}
                            </div>
                        </Tarjeta>
                    </div>

                    <form onSubmit={guardar} className="lg:col-span-2">
                        <Tarjeta titulo="Seguimiento" className="flex h-full flex-col gap-5">
                            <div>
                                <p className="mb-2 text-sm font-semibold text-gray-900">Estado</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(estados).map(([valor, label]) => {
                                        const activo = data.estado === valor;
                                        const colores = estadoReservaUi(valor);
                                        return (
                                            <button
                                                key={valor}
                                                type="button"
                                                onClick={() => setData('estado', valor)}
                                                aria-pressed={activo}
                                                className={cn(
                                                    'flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                                                    activo ? `${colores.solido} shadow-sm` : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300',
                                                )}
                                            >
                                                {!activo && <span className={cn('size-2 rounded-full', colores.punto)} />}
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.estado && <p className="mt-1 text-sm text-red-600">{errors.estado}</p>}
                            </div>

                            <div>
                                <label htmlFor="notas" className="mb-2 block text-sm font-semibold text-gray-900">
                                    Notas internas <span className="font-normal text-gray-400">(solo el equipo)</span>
                                </label>
                                <Textarea
                                    id="notas"
                                    rows={4}
                                    value={data.notas}
                                    onChange={(e) => setData('notas', e.target.value)}
                                    error={errors.notas}
                                    placeholder="Ej. Confirmado con el chofer Juan, auto ABC-123"
                                />
                            </div>

                            <div className="mt-auto flex flex-col gap-2">
                                <Button type="submit" variant="secondary" icon={Save} fullWidth disabled={processing || !form.isDirty}>
                                    {processing ? 'Guardando...' : 'Guardar'}
                                </Button>
                                {recentlySuccessful && (
                                    <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-emerald-700" role="status">
                                        <CircleCheckBig className="size-4" aria-hidden="true" /> Guardado
                                    </p>
                                )}
                            </div>
                        </Tarjeta>
                    </form>
                </div>
            )}
        </Modal>
    );
}
