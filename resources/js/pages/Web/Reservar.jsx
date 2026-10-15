import { CalendarCheck, CalendarDays, CircleCheckBig, Clock, MessageCircleMore, Minus, Plus, RotateCcw, Send, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import Textarea from '@/components/ui/Textarea';
import AceptaPolitica from '@/components/web/AceptaPolitica';
import PaginaApi from '@/components/web/PaginaApi';
import { useFormApi } from '@/hooks/useFormApi';
import { useSitio } from '@/hooks/useSitio';
import { registrarLead } from '@/lib/analitica';
import { cn } from '@/lib/utils';

const MAX_PASAJEROS = 50;

const PASOS = [
    { titulo: 'Envía tu reserva', texto: 'Cuéntanos qué necesitas, el día y la hora.' },
    { titulo: 'Te confirmamos por WhatsApp', texto: 'Un asesor revisa tu reserva y te escribe para confirmarla.' },
    { titulo: 'Listo', texto: 'Te esperamos en el día y la hora acordados.' },
];

/** "2026-10-20" → "lunes 20 de octubre" */
const fechaLegible = (fecha) =>
    new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${fecha}T12:00:00`));

/** Título de una parte del formulario, con su número. */
function Paso({ numero, titulo, children }) {
    return (
        <fieldset className="grid gap-4">
            <legend className="mb-4 flex items-center gap-3 text-lg font-bold text-primary">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-extrabold">{numero}</span>
                {titulo}
            </legend>
            {children}
        </fieldset>
    );
}

/** Opciones de lo que se puede reservar, como tarjetas (una sola opción: no se muestra). */
function ElegirTipo({ tipos, value, onChange, error }) {
    return (
        <div>
            <div role="radiogroup" aria-label="Qué quieres reservar" className="grid gap-3 sm:grid-cols-2">
                {tipos.map((tipo) => {
                    const activo = value === tipo.id;
                    return (
                        <button
                            key={tipo.id}
                            type="button"
                            role="radio"
                            aria-checked={activo}
                            onClick={() => onChange(tipo.id)}
                            className={cn(
                                'flex items-start gap-3 rounded-2xl p-4 text-left ring-2 transition duration-200',
                                activo ? 'bg-primary text-white ring-primary' : 'bg-white text-primary ring-primary-100 hover:ring-primary-300',
                            )}
                        >
                            <span
                                aria-hidden="true"
                                className={cn('mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ring-2', activo ? 'bg-accent ring-accent' : 'ring-primary-200')}
                            >
                                {activo && <span className="size-2 rounded-full bg-primary" />}
                            </span>
                            <span className="min-w-0">
                                <span className="block font-bold">{tipo.nombre}</span>
                                {tipo.descripcion && <span className={cn('mt-0.5 block text-sm', activo ? 'text-white/75' : 'text-primary-700/75')}>{tipo.descripcion}</span>}
                            </span>
                        </button>
                    );
                })}
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

/**
 * Punto de partida y destino en un solo recuadro, unidos por una línea punteada (como en las
 * apps de viaje). Los dos son obligatorios; sus errores se muestran debajo.
 */
function Ruta({ data, setData, errors }) {
    const error = errors.origen || errors.destino;
    const fila = 'flex h-14 items-center gap-4 px-4';
    const entrada = 'h-full min-w-0 flex-1 bg-transparent text-sm text-primary placeholder:text-primary-400 focus:outline-none sm:text-base';

    return (
        <div>
            <div
                className={cn(
                    'relative rounded-2xl border bg-white transition focus-within:border-primary focus-within:ring-2 focus-within:ring-accent',
                    error ? 'border-red-500' : 'border-primary-200',
                )}
            >
                <span aria-hidden="true" className="absolute top-[2.4rem] bottom-[2.4rem] left-[1.31rem] border-l-2 border-dotted border-primary-300" />
                <div className={fila}>
                    <span aria-hidden="true" className="size-3 shrink-0 rounded-full bg-accent ring-4 ring-accent/30" />
                    <label htmlFor="origen" className="sr-only">
                        Punto de partida
                    </label>
                    <input
                        id="origen"
                        value={data.origen}
                        onChange={(e) => setData('origen', e.target.value)}
                        maxLength={150}
                        aria-required="true"
                        aria-invalid={errors.origen ? true : undefined}
                        placeholder="¿Desde dónde? Dirección o lugar"
                        className={entrada}
                    />
                </div>
                <div className="ml-11 border-t border-primary-100" />
                <div className={fila}>
                    <span aria-hidden="true" className="size-3 shrink-0 rounded-[3px] bg-primary ring-4 ring-primary/15" />
                    <label htmlFor="destino" className="sr-only">
                        Destino
                    </label>
                    <input
                        id="destino"
                        value={data.destino}
                        onChange={(e) => setData('destino', e.target.value)}
                        maxLength={150}
                        aria-required="true"
                        aria-invalid={errors.destino ? true : undefined}
                        placeholder="¿A dónde vas?"
                        className={entrada}
                    />
                </div>
            </div>
            {[errors.origen, errors.destino].filter(Boolean).map((mensaje) => (
                <p key={mensaje} className="mt-1.5 text-sm text-red-600" role="alert">
                    {mensaje}
                </p>
            ))}
        </div>
    );
}

/** Cantidad de pasajeros con botones − y + (también se puede escribir). */
function Pasajeros({ value, onChange, error }) {
    const cambiar = (n) => onChange(Math.min(MAX_PASAJEROS, Math.max(1, n)));
    const boton = 'flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary transition hover:bg-accent disabled:opacity-40 sm:size-12';

    return (
        <FormField label="Pasajeros" htmlFor="pasajeros" error={error}>
            <div className="flex items-center gap-2">
                <button type="button" onClick={() => cambiar(value - 1)} disabled={value <= 1} aria-label="Un pasajero menos" className={boton}>
                    <Minus className="size-4" aria-hidden="true" />
                </button>
                <Input
                    id="pasajeros"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={MAX_PASAJEROS}
                    value={value}
                    onChange={(e) => cambiar(Number(e.target.value) || 1)}
                    error={error}
                    className="w-20 text-center tabular-nums"
                />
                <button type="button" onClick={() => cambiar(value + 1)} disabled={value >= MAX_PASAJEROS} aria-label="Un pasajero más" className={boton}>
                    <Plus className="size-4" aria-hidden="true" />
                </button>
            </div>
        </FormField>
    );
}

/** Después de enviar: resumen de la reserva y el botón para mandarla por WhatsApp. */
function ReservaEnviada({ reserva, tipo, whatsappUrl, onOtra }) {
    const filas = [
        ['Reserva', tipo?.nombre],
        tipo?.pide_ruta && ['Desde', reserva.origen],
        tipo?.pide_ruta && ['Hasta', reserva.destino],
        ['Fecha', `${fechaLegible(reserva.fecha)}${reserva.hora ? `, ${reserva.hora}` : ''}`],
        tipo?.pide_ruta && ['Pasajeros', reserva.pasajeros],
    ].filter(Boolean);

    return (
        <div className="motion-safe:animate-deslizar" role="status">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-accent text-primary">
                <CircleCheckBig className="size-8" aria-hidden="true" />
            </span>
            <h2 className="mt-6 text-3xl leading-tight font-bold tracking-[-0.02em] text-balance">¡Recibimos tu reserva!</h2>
            <p className="mt-2 max-w-lg text-lg text-pretty text-primary-700/80">
                {whatsappUrl
                    ? 'Envíanosla por WhatsApp para confirmarla más rápido. El mensaje ya está escrito.'
                    : 'Un asesor te escribirá a tu celular para confirmarla.'}
            </p>

            <dl className="mt-8 divide-y divide-primary-100 rounded-2xl bg-primary-50/60 px-5 ring-1 ring-primary-100">
                {filas.map(([etiqueta, valor]) => (
                    <div key={etiqueta} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:gap-6">
                        <dt className="shrink-0 text-sm text-primary-700/70 sm:w-24">{etiqueta}</dt>
                        <dd className="font-semibold first-letter:uppercase">{valor}</dd>
                    </div>
                ))}
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {whatsappUrl && (
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 text-base font-semibold text-white transition hover:brightness-95 sm:h-14 sm:px-8 sm:text-lg"
                    >
                        <FaWhatsapp className="size-5" aria-hidden="true" /> Enviar por WhatsApp
                    </a>
                )}
                <Button variant="outline" size="lg" icon={RotateCcw} onClick={onOtra}>
                    Hacer otra reserva
                </Button>
            </div>
        </div>
    );
}

function FormularioReserva({ tipos, hoy }) {
    // ?tipo=viaje (botones del banner): ese tipo ya viene elegido
    const [inicial] = useState(() => {
        const slug = new URLSearchParams(window.location.search).get('tipo');
        return (tipos.find((t) => t.slug === slug) ?? tipos[0])?.id ?? '';
    });
    const vacio = {
        tipo_reserva_id: inicial,
        origen: '',
        destino: '',
        fecha: '',
        hora: '',
        pasajeros: 1,
        nombre: '',
        telefono: '',
        comentario: '',
        website: '',
        acepta_politica: false,
    };
    const form = useFormApi(vacio);
    const { data, setData, errors, processing } = form;
    const [enviada, setEnviada] = useState(null);

    const tipo = tipos.find((t) => t.id === data.tipo_reserva_id);
    const conRuta = tipo?.pide_ruta ?? true;

    const campo = (nombre) => ({ id: nombre, value: data[nombre], onChange: (e) => setData(nombre, e.target.value), error: errors[nombre] });

    const enviar = (e) => {
        e.preventDefault();
        form.post('/reservas', {
            recargar: false,
            avisar: false,
            onSuccess: (respuesta) => {
                const whatsappUrl = respuesta.data?.whatsapp_url ?? null;
                registrarLead('reserva');
                setEnviada({ reserva: data, tipo, whatsappUrl });
                // Se intenta abrir WhatsApp de una vez; si el navegador lo bloquea, queda el botón
                if (whatsappUrl) window.open(whatsappUrl, '_blank', 'noopener');
                window.scrollTo({ top: document.getElementById('reserva')?.offsetTop - 96, behavior: 'smooth' });
            },
        });
    };

    if (enviada) {
        return (
            <ReservaEnviada
                {...enviada}
                onOtra={() => {
                    form.setData({ ...vacio, nombre: data.nombre, telefono: data.telefono, tipo_reserva_id: data.tipo_reserva_id });
                    setEnviada(null);
                }}
            />
        );
    }

    let numero = 0;

    return (
        <form onSubmit={enviar} noValidate className="grid gap-10">
            {tipos.length > 1 && (
                <Paso numero={++numero} titulo="¿Qué quieres reservar?">
                    <ElegirTipo tipos={tipos} value={data.tipo_reserva_id} onChange={(id) => setData('tipo_reserva_id', id)} error={errors.tipo_reserva_id} />
                </Paso>
            )}

            {conRuta && (
                <Paso numero={++numero} titulo="Tu recorrido">
                    <Ruta data={data} setData={setData} errors={errors} />
                </Paso>
            )}

            <Paso numero={++numero} titulo="¿Cuándo?">
                <div className={cn('grid gap-4', conRuta ? 'sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]' : 'sm:grid-cols-2')}>
                    <FormField label="Fecha" htmlFor="fecha" error={errors.fecha} required>
                        <Input {...campo('fecha')} type="date" min={hoy} />
                    </FormField>
                    <FormField label="Hora" htmlFor="hora" error={errors.hora}>
                        <Input {...campo('hora')} type="time" />
                    </FormField>
                    {conRuta && <Pasajeros value={Number(data.pasajeros) || 1} onChange={(n) => setData('pasajeros', n)} error={errors.pasajeros} />}
                </div>
            </Paso>

            <Paso numero={++numero} titulo="Tus datos">
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Nombre" htmlFor="nombre" error={errors.nombre} required>
                        <Input {...campo('nombre')} autoComplete="name" maxLength={100} placeholder="Tu nombre y apellido" />
                    </FormField>
                    <FormField label="Celular" htmlFor="telefono" error={errors.telefono} required>
                        <Input {...campo('telefono')} type="tel" inputMode="tel" autoComplete="tel" placeholder="999 999 999" />
                    </FormField>
                    <FormField label="Comentario" htmlFor="comentario" error={errors.comentario} hint="Opcional. Ej. equipaje, una parada en el camino." className="sm:col-span-2">
                        <Textarea {...campo('comentario')} rows={3} maxLength={1000} placeholder="¿Algo que debamos saber?" />
                    </FormField>
                </div>
            </Paso>

            {/* Campo trampa anti-spam: oculto para personas */}
            <div className="hidden" aria-hidden="true">
                <label htmlFor="website">No llenar este campo</label>
                <input id="website" tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => setData('website', e.target.value)} />
            </div>

            <div className="grid gap-5 border-t border-primary-100 pt-8">
                <AceptaPolitica checked={data.acepta_politica} onChange={(valor) => setData('acepta_politica', valor)} error={errors.acepta_politica} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                    <Button type="submit" variant="secondary" size="lg" icon={Send} disabled={processing}>
                        {processing ? 'Enviando...' : 'Reservar ahora'}
                    </Button>
                    <p className="flex items-center gap-2 text-sm text-primary-700/75">
                        <FaWhatsapp className="size-4 shrink-0 text-[#25D366]" aria-hidden="true" /> Al enviar, se abre WhatsApp con tu reserva lista.
                    </p>
                </div>
            </div>
        </form>
    );
}

/** Sin nada que reservar (todos los tipos ocultos): aviso y WhatsApp. */
function SinReservas({ whatsapp }) {
    return (
        <div className="flex flex-col items-start">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-accent">
                <CalendarCheck className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-6 text-2xl font-bold">Por ahora no hay reservas en línea</h2>
            <p className="mt-2 text-lg text-primary-700/80">Escríbenos y te ayudamos a coordinar.</p>
            {whatsapp && (
                <Button href={whatsapp} newTab icon={FaWhatsapp} className="mt-6">
                    Escríbenos por WhatsApp
                </Button>
            )}
        </div>
    );
}

function ReservarContenido({ secciones, tipos, hoy }) {
    const sitio = useSitio();
    const hero = secciones['reservar.hero'];
    const whatsapp = sitio.whatsappUrl();

    return (
        <PublicLayout title={hero?.titulo || 'Reservar'} description={hero?.contenido}>
            <PageHero imagen={hero?.imagen_url} colorTitulo={hero?.color_titulo} colorTexto={hero?.color_texto} title={hero?.titulo || 'Reserva tu viaje'} description={hero?.contenido} />

            <Section id="reserva" background="muted">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-start lg:gap-10">
                    <Revelar className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-primary-100 sm:p-10">
                        {tipos.length ? <FormularioReserva tipos={tipos} hoy={hoy} /> : <SinReservas whatsapp={whatsapp} />}
                    </Revelar>

                    <aside className="grid gap-6 lg:sticky lg:top-28">
                        <Revelar desde="derecha" retraso={120} className="rounded-[1.75rem] bg-primary p-6 text-white sm:p-8">
                            <h2 className="text-xl font-bold">Cómo funciona</h2>
                            <ol className="mt-6 grid gap-6">
                                {PASOS.map((paso, i) => (
                                    <li key={paso.titulo} className="relative flex gap-4">
                                        {i < PASOS.length - 1 && <span aria-hidden="true" className="absolute top-10 bottom-[-1.25rem] left-[1.05rem] w-px bg-white/20" />}
                                        <span className="flex size-[2.1rem] shrink-0 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-primary">{i + 1}</span>
                                        <span>
                                            <span className="block font-semibold">{paso.titulo}</span>
                                            <span className="mt-0.5 block text-sm text-white/70">{paso.texto}</span>
                                        </span>
                                    </li>
                                ))}
                            </ol>
                            <div className="mt-8 grid grid-cols-3 gap-2 border-t border-white/15 pt-6 text-center text-xs text-white/70">
                                <span className="flex flex-col items-center gap-1.5">
                                    <CalendarDays className="size-5 text-accent" aria-hidden="true" /> Elige el día
                                </span>
                                <span className="flex flex-col items-center gap-1.5">
                                    <Clock className="size-5 text-accent" aria-hidden="true" /> y la hora
                                </span>
                                <span className="flex flex-col items-center gap-1.5">
                                    <UsersRound className="size-5 text-accent" aria-hidden="true" /> para tu grupo
                                </span>
                            </div>
                        </Revelar>

                        {whatsapp && (
                            <Revelar desde="derecha" retraso={escalonar(2, 120)}>
                                <a
                                    href={whatsapp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-4 rounded-[1.75rem] bg-white p-5 ring-1 ring-primary-100 transition hover:ring-primary-300"
                                >
                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#25D366] text-white transition-transform duration-300 group-hover:scale-110">
                                        <MessageCircleMore className="size-6" aria-hidden="true" />
                                    </span>
                                    <span>
                                        <span className="block font-bold">¿Prefieres escribirnos?</span>
                                        <span className="block text-sm text-primary-700/75">Coordina tu reserva por WhatsApp.</span>
                                    </span>
                                </a>
                            </Revelar>
                        )}
                    </aside>
                </div>
            </Section>
        </PublicLayout>
    );
}

/** Reservar (viajes u otros servicios del panel): el contenido llega de la API (GET /api/paginas/reservar). */
export default function Reservar() {
    return <PaginaApi url="/paginas/reservar">{(datos) => <ReservarContenido {...datos} />}</PaginaApi>;
}
