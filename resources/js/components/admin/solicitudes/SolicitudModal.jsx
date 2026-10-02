import { usePage } from '@inertiajs/react';
import { Calculator, CircleCheckBig, Mail, MailOpen, Phone, Save, Trash, UserRound } from 'lucide-react';
import { useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { estadoUi, iniciales, whatsappDe } from '@/components/admin/solicitudes/estados';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { useFormApi } from '@/hooks/useFormApi';
import { formatoFecha } from '@/lib/fechas';
import { cn } from '@/lib/utils';

// En las cotizaciones la primera línea es "Quiero cotizar: Plan — Opción"
const ETIQUETAS = { 'Quiero cotizar': 'Plan' };

function Tarjeta({ titulo, children, className }) {
    return (
        <section className={cn('rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-5', className)}>
            {titulo && <h3 className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">{titulo}</h3>}
            {children}
        </section>
    );
}

/** Mensaje de la solicitud: en cotizaciones, las líneas "Clave: valor" se muestran como tabla. */
function ContenidoMensaje({ mensaje }) {
    if (mensaje.origen !== 'cotizador') {
        return <p className="text-sm leading-relaxed whitespace-pre-line text-gray-800">{mensaje.mensaje}</p>;
    }

    const filas = mensaje.mensaje
        .split('\n')
        .filter((linea) => linea.trim())
        .map((linea) => {
            const partes = linea.match(/^([^:]{2,30}):\s*(.+)$/);
            return partes ? [ETIQUETAS[partes[1]] ?? partes[1], partes[2]] : [null, linea];
        });

    return (
        <dl className="divide-y divide-gray-100 text-sm">
            {filas.map(([clave, valor], i) => (
                <div key={i} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:gap-4">
                    {clave && <dt className="shrink-0 text-gray-500 sm:w-28">{clave}</dt>}
                    <dd className={cn('text-gray-900', clave ? 'font-semibold' : 'text-gray-700')}>{valor}</dd>
                </div>
            ))}
        </dl>
    );
}

function DatoContacto({ icono: Icono, etiqueta, children }) {
    return (
        <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
                <Icono className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className="text-xs text-gray-500">{etiqueta}</p>
                <p className="font-semibold break-all text-gray-900">{children}</p>
            </div>
        </div>
    );
}

/** Detalle de una solicitud con acciones de contacto y formulario de seguimiento. */
export default function SolicitudModal({ mensaje, estados, origenes, usuarios, onClose, onMarcarNoLeido, onEliminar }) {
    const { auth } = usePage().props;
    const form = useFormApi({ estado: 'nuevo', asignado_a: '', notas: '' });
    const { data, setData, errors, processing, recentlySuccessful } = form;

    // Al abrir otra solicitud, el formulario toma sus datos
    useEffect(() => {
        if (!mensaje) return;
        form.setData({ estado: mensaje.estado, asignado_a: mensaje.asignado_a ?? '', notas: mensaje.notas ?? '' });
        form.setDefaults({ estado: mensaje.estado, asignado_a: mensaje.asignado_a ?? '', notas: mensaje.notas ?? '' });
        form.clearErrors();
    }, [mensaje?.id]);

    const guardar = (e) => {
        e.preventDefault();
        form.put(`/admin/solicitudes/${mensaje.id}/seguimiento`, { onSuccess: () => form.setDefaults() });
    };

    const ui = mensaje ? estadoUi(mensaje.estado) : null;

    return (
        <Modal
            open={Boolean(mensaje)}
            onClose={onClose}
            maxWidth="max-w-4xl"
            bodyClassName="bg-gray-50"
            header={
                mensaje && (
                    <div className="bg-primary px-5 py-5 text-white sm:px-6">
                        <div className="flex items-center gap-4 pr-10">
                            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-xl font-extrabold text-primary">
                                {iniciales(mensaje.nombre_completo)}
                            </span>
                            <div className="min-w-0">
                                <h2 className="truncate text-xl font-bold">{mensaje.nombre_completo}</h2>
                                <p className="text-sm text-primary-200">Recibido el {formatoFecha(mensaje.created_at)}</p>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                                    <span className={cn('rounded-full px-2.5 py-1', ui.solido)}>{estados[mensaje.estado]}</span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1">
                                        {mensaje.origen === 'cotizador' ? <Calculator className="size-3.5" /> : <Mail className="size-3.5" />}
                                        {origenes[mensaje.origen]}
                                    </span>
                                    {mensaje.tipo_consulta_texto && (
                                        <span className="rounded-full bg-white/15 px-2.5 py-1">{mensaje.tipo_consulta_texto}</span>
                                    )}
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1">
                                        <UserRound className="size-3.5" /> {mensaje.asignado?.name ?? 'Sin asignar'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            footer={
                mensaje && (
                    <>
                        <Button variant="ghost" size="sm" icon={Trash} onClick={() => onEliminar(mensaje)} className="border border-red-200 text-red-600 hover:bg-red-50 sm:mr-auto">
                            Eliminar
                        </Button>
                        <Button variant="ghost" size="sm" icon={Mail} onClick={() => onMarcarNoLeido(mensaje)} className="border border-gray-200">
                            Marcar como no leído
                        </Button>
                    </>
                )
            }
        >
            {mensaje && (
                <div className="grid gap-5 lg:grid-cols-5">
                    <div className="flex flex-col gap-5 lg:col-span-3">
                        <Tarjeta titulo="Contacto">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <DatoContacto icono={Phone} etiqueta="Celular">
                                    {mensaje.telefono}
                                </DatoContacto>
                                {mensaje.email && (
                                    <DatoContacto icono={MailOpen} etiqueta="Correo">
                                        {mensaje.email}
                                    </DatoContacto>
                                )}
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-2">
                                <a
                                    href={whatsappDe(mensaje.telefono)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
                                >
                                    <FaWhatsapp className="size-4" aria-hidden="true" /> WhatsApp
                                </a>
                                <a
                                    href={`tel:${mensaje.telefono.replace(/\s/g, '')}`}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800"
                                >
                                    <Phone className="size-4" aria-hidden="true" /> Llamar
                                </a>
                                <a
                                    href={mensaje.email ? `mailto:${mensaje.email}` : undefined}
                                    aria-disabled={!mensaje.email}
                                    className={cn(
                                        'flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ring-1 transition',
                                        mensaje.email ? 'bg-white text-primary ring-primary-200 hover:bg-primary-50' : 'pointer-events-none bg-gray-100 text-gray-400 ring-gray-200',
                                    )}
                                >
                                    <Mail className="size-4" aria-hidden="true" /> Correo
                                </a>
                            </div>
                        </Tarjeta>

                        <Tarjeta titulo={mensaje.origen === 'cotizador' ? 'Cotización solicitada' : 'Mensaje'}>
                            {mensaje.asunto && <p className="mb-2 text-base font-bold text-primary">{mensaje.asunto}</p>}
                            <ContenidoMensaje mensaje={mensaje} />
                        </Tarjeta>
                    </div>

                    <form onSubmit={guardar} className="lg:col-span-2">
                        <Tarjeta titulo="Seguimiento" className="flex h-full flex-col gap-5">
                            <div>
                                <p className="mb-2 text-sm font-semibold text-gray-900">Etapa</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(estados).map(([valor, label]) => {
                                        const activo = data.estado === valor;
                                        const colores = estadoUi(valor);
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
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <label htmlFor="asignado_a" className="text-sm font-semibold text-gray-900">
                                        Asesor asignado
                                    </label>
                                    {String(data.asignado_a) !== String(auth.user.id) && (
                                        <button type="button" onClick={() => setData('asignado_a', auth.user.id)} className="text-xs font-semibold text-primary hover:underline">
                                            Asignarme
                                        </button>
                                    )}
                                </div>
                                <Select
                                    id="asignado_a"
                                    value={data.asignado_a}
                                    onChange={(e) => setData('asignado_a', e.target.value)}
                                    error={errors.asignado_a}
                                    placeholder="Sin asignar"
                                    options={usuarios.map((u) => ({ value: u.id, label: u.name }))}
                                />
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
                                    placeholder="Ej. Llamé el lunes, pidió la cuota del plan 15k"
                                />
                            </div>

                            <div className="mt-auto flex flex-col gap-2">
                                <Button type="submit" variant="secondary" icon={Save} fullWidth disabled={processing || !form.isDirty}>
                                    {processing ? 'Guardando...' : 'Guardar seguimiento'}
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
