import { Link } from '@inertiajs/react';
import { Check, CircleAlert, CircleCheck, FilePlus, IdCard, Search, Ticket } from 'lucide-react';
import { useState } from 'react';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import LibroEncabezado from '@/components/web/LibroEncabezado';
import { AyudaLateral, DatoLateral, TarjetaLateral } from '@/components/web/LibroLateral';
import { useFormApi } from '@/hooks/useFormApi';
import { formatoFecha } from '@/lib/fechas';
import { fechaSimple } from '@/lib/reclamacion';
import { cn } from '@/lib/utils';

const PASOS = ['Registrado', 'En revisión', 'Respondido'];

/** Línea de avance del reclamo: registrado → en revisión → respondido. */
function Avance({ atendido }) {
    const actual = atendido ? 2 : 1;

    return (
        <ol className="grid grid-cols-3">
            {PASOS.map((paso, i) => {
                const hecho = i < actual || (atendido && i === actual);
                const enCurso = !atendido && i === actual;
                return (
                    <li key={paso} className="flex flex-col items-center gap-2 text-center">
                        <span className="flex w-full items-center">
                            <span className={cn('h-0.5 flex-1', i === 0 ? 'bg-transparent' : i <= actual ? 'bg-primary' : 'bg-primary-100')} />
                            <span
                                className={cn(
                                    'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                    hecho && 'bg-primary text-accent',
                                    enCurso && 'bg-accent text-primary ring-4 ring-accent/30',
                                    !hecho && !enCurso && 'bg-primary-100 text-primary-400',
                                )}
                            >
                                {hecho ? <Check className="size-4" aria-hidden="true" /> : i + 1}
                            </span>
                            <span className={cn('h-0.5 flex-1', i === PASOS.length - 1 ? 'bg-transparent' : i < actual ? 'bg-primary' : 'bg-primary-100')} />
                        </span>
                        <span className={cn('text-xs font-semibold sm:text-sm', hecho || enCurso ? 'text-primary' : 'text-primary-400')}>{paso}</span>
                    </li>
                );
            })}
        </ol>
    );
}

function Resultado({ r }) {
    const atendido = r.estado === 'atendido';

    return (
        <section aria-labelledby="resultado" className="rounded-2xl bg-white shadow-sm ring-1 ring-primary-100">
            <header className="flex flex-col gap-3 border-b border-primary-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                    <p className="text-xs font-bold tracking-wider text-primary-500 uppercase">{r.tipo === 'queja' ? 'Queja' : 'Reclamo'}</p>
                    <h2 id="resultado" className="text-xl font-extrabold text-primary">
                        Hoja N° {r.codigo}
                    </h2>
                </div>
                <span
                    className={cn(
                        'self-start rounded-full px-3 py-1 text-xs font-bold sm:self-auto',
                        atendido ? 'bg-green-100 text-green-700' : r.vencido ? 'bg-red-100 text-red-700' : 'bg-accent text-primary',
                    )}
                >
                    {atendido ? 'Respondido' : r.vencido ? 'Fuera de plazo' : 'Pendiente de respuesta'}
                </span>
            </header>

            <div className="flex flex-col gap-6 p-5 sm:p-6">
                <Avance atendido={atendido} />

                <dl className="grid gap-x-8 sm:grid-cols-2">
                    <DatoLateral etiqueta="Fecha de registro">{formatoFecha(r.created_at)}</DatoLateral>
                    <DatoLateral etiqueta="Fecha límite de respuesta">{fechaSimple(r.fecha_limite)}</DatoLateral>
                    {atendido && <DatoLateral etiqueta="Fecha de respuesta">{formatoFecha(r.respondido_at)}</DatoLateral>}
                </dl>

                {atendido ? (
                    <div className="rounded-xl bg-primary-50 p-4 sm:p-5">
                        <p className="mb-2 flex items-center gap-2 text-sm font-bold text-primary">
                            <CircleCheck className="size-4 text-green-600" aria-hidden="true" /> Respuesta del proveedor
                        </p>
                        <p className="text-sm whitespace-pre-line text-primary-700">{r.respuesta}</p>
                    </div>
                ) : (
                    <p className="flex gap-3 rounded-xl bg-primary-50 p-4 text-sm text-primary-700">
                        <CircleAlert className="mt-0.5 size-4 shrink-0 text-primary-500" aria-hidden="true" />
                        Estamos revisando tu caso. Te enviaremos la respuesta al correo que registraste, a más tardar el {fechaSimple(r.fecha_limite)}.
                    </p>
                )}
            </div>
        </section>
    );
}

/** Consulta pública del estado de una hoja de reclamación (número de hoja + documento). */
export default function ConsultarReclamacion({ diasRespuesta }) {
    const form = useFormApi({ codigo: '', numero_documento: '' });
    const { data, setData, errors, processing } = form;
    const [resultado, setResultado] = useState(null);

    const buscar = (e) => {
        e.preventDefault();
        setResultado(null);
        form.post('/reclamaciones/consultar', { recargar: false, avisar: false, onSuccess: (respuesta) => setResultado(respuesta.data) });
    };

    return (
        <PublicLayout title="Consultar mi reclamo" description="Consulta el estado de tu reclamo o queja.">
            <div className="bg-primary-50 py-6 sm:py-8 lg:py-10">
                <Container className="flex flex-col gap-6">
                    <LibroEncabezado subtitulo="Consulta el estado de tu reclamo o queja." />

                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="flex min-w-0 flex-col gap-6">
                            <section aria-labelledby="consulta" className="rounded-2xl bg-white shadow-sm ring-1 ring-primary-100">
                                <header className="flex items-start gap-3 border-b border-primary-100 px-5 py-4 sm:px-6">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-accent">
                                        <Search className="size-4" aria-hidden="true" />
                                    </span>
                                    <div className="pt-1">
                                        <h2 id="consulta" className="text-sm font-bold tracking-wide text-primary uppercase sm:text-base">
                                            Consultar mi reclamo
                                        </h2>
                                        <p className="mt-1 text-sm text-primary-700/80">
                                            Ingresa el número de hoja que recibiste en tu correo y el documento con el que la registraste.
                                        </p>
                                    </div>
                                </header>
                                <form onSubmit={buscar} className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6" noValidate>
                                    <FormField label="Número de hoja" htmlFor="codigo" error={errors.codigo} required>
                                        <div className="relative">
                                            <Ticket className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-primary-400" aria-hidden="true" />
                                            <Input
                                                id="codigo"
                                                value={data.codigo}
                                                onChange={(e) => setData('codigo', e.target.value)}
                                                error={errors.codigo}
                                                placeholder="Ej.: 2026-000001"
                                                className="pl-10"
                                            />
                                        </div>
                                    </FormField>
                                    <FormField label="Número de documento" htmlFor="numero_documento" error={errors.numero_documento} required>
                                        <div className="relative">
                                            <IdCard className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-primary-400" aria-hidden="true" />
                                            <Input
                                                id="numero_documento"
                                                value={data.numero_documento}
                                                onChange={(e) => setData('numero_documento', e.target.value)}
                                                error={errors.numero_documento}
                                                placeholder="DNI, CE, pasaporte o RUC"
                                                maxLength={20}
                                                className="pl-10"
                                            />
                                        </div>
                                    </FormField>
                                    <div className="sm:col-span-2">
                                        <Button type="submit" variant="secondary" icon={Search} disabled={processing}>
                                            {processing ? 'Buscando...' : 'Consultar'}
                                        </Button>
                                    </div>
                                </form>
                            </section>

                            {resultado && <Resultado r={resultado} />}
                        </div>

                        <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
                            <TarjetaLateral icon={CircleAlert} titulo="Importante" oscura>
                                <ul className="flex flex-col gap-3 text-sm text-white/85">
                                    <li className="flex gap-2.5">
                                        <CircleCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                                        <span>
                                            Respondemos en un plazo máximo de <strong className="text-white">{diasRespuesta} días hábiles</strong>.
                                        </span>
                                    </li>
                                    <li className="flex gap-2.5">
                                        <CircleCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                                        <span>La respuesta también llega al correo que registraste.</span>
                                    </li>
                                </ul>
                                <Link
                                    href="/libro-de-reclamaciones"
                                    className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-primary transition hover:brightness-95"
                                >
                                    <FilePlus className="size-4" aria-hidden="true" /> Registrar un reclamo
                                </Link>
                            </TarjetaLateral>

                            <AyudaLateral />
                        </aside>
                    </div>
                </Container>
            </div>
        </PublicLayout>
    );
}
