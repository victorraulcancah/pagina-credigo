import { Link, router } from '@inertiajs/react';
import { CircleAlert, CircleCheck, ClipboardList, FileText, ImagePlus, Mail, Search, Send, Smartphone, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import PublicLayout from '@/components/layout/PublicLayout';
import PaginaApi from '@/components/web/PaginaApi';
import ArchivoInput from '@/components/ui/ArchivoInput';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import Container from '@/components/ui/Container';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import LibroEncabezado from '@/components/web/LibroEncabezado';
import { AyudaLateral, DatoLateral, TarjetaLateral } from '@/components/web/LibroLateral';
import { useFormApi } from '@/hooks/useFormApi';
import { useSitio } from '@/hooks/useSitio';
import { formatoFecha } from '@/lib/fechas';
import { sumarDiasHabiles } from '@/lib/reclamacion';
import { cn } from '@/lib/utils';

const LONGITUD_DOCUMENTO = { DNI: 8, RUC: 11 };
const AYUDA_DOCUMENTO = { DNI: 'El DNI debe tener 8 dígitos.', RUC: 'El RUC debe tener 11 dígitos.' };

/** Cada bloque del formulario es una tarjeta con su número y título. */
function Bloque({ numero, titulo, descripcion, opcional = false, className, children }) {
    const id = `bloque-${numero}`;

    return (
        <section aria-labelledby={id} className="rounded-2xl bg-white shadow-sm ring-1 ring-primary-100">
            <header className="flex items-start gap-3 border-b border-primary-100 px-5 py-4 sm:px-6">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-accent">{numero}</span>
                <div className="min-w-0 pt-1">
                    <h2 id={id} className="text-sm font-bold tracking-wide text-primary uppercase sm:text-base">
                        {titulo}
                        {opcional && <span className="ml-2 text-xs font-medium tracking-normal text-primary-400 normal-case">(opcional)</span>}
                    </h2>
                    {descripcion && <p className="mt-1 text-sm text-primary-700/80">{descripcion}</p>}
                </div>
            </header>
            <div className={cn('grid gap-5 p-5 sm:grid-cols-2 sm:p-6', className)}>{children}</div>
        </section>
    );
}

/** Campo con ícono a la izquierda (celular, correo). */
function ConIcono({ icon: Icono, children }) {
    return (
        <div className="relative">
            <Icono className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-primary-400" aria-hidden="true" />
            {children}
        </div>
    );
}

/** Fecha y hora actuales, se actualizan cada minuto. */
function useAhora() {
    const [ahora, setAhora] = useState(() => new Date());

    useEffect(() => {
        const intervalo = setInterval(() => setAhora(new Date()), 60_000);
        return () => clearInterval(intervalo);
    }, []);

    return ahora;
}

function OpcionTipo({ valor, actual, onChange, titulo, descripcion }) {
    const activa = actual === valor;

    return (
        <label
            className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition',
                activa ? 'border-primary bg-primary-50' : 'border-primary-100 hover:border-primary-300',
            )}
        >
            <input type="radio" name="tipo" value={valor} checked={activa} onChange={() => onChange(valor)} className="mt-1 size-4 accent-primary" />
            <span>
                <span className="block font-bold text-primary">{titulo}</span>
                <span className="block text-sm text-primary-700/80">{descripcion}</span>
            </span>
        </label>
    );
}

/** Libro de Reclamaciones virtual (Ley N° 29571, Código de Protección y Defensa del Consumidor). */
function LibroReclamacionesContenido({ tiposDocumento, tiposComprobante, soluciones, diasRespuesta }) {
    const sitio = useSitio();
    const form = useFormApi({
        // 1. Consumidor
        nombre: '',
        tipo_documento: 'DNI',
        numero_documento: '',
        telefono: '',
        email: '',
        domicilio: '',
        menor_de_edad: false,
        apoderado: '',
        apoderado_tipo_documento: 'DNI',
        apoderado_numero_documento: '',
        // 2. Compra
        comprobante_tipo: '',
        comprobante_numero: '',
        fecha_compra: '',
        numero_contrato: '',
        producto_codigo: '',
        producto_nombre: '',
        producto_marca: '',
        producto_modelo: '',
        tipo_bien: 'producto',
        monto_reclamado: '',
        descripcion_bien: '',
        // 3 y 4. Tipo y detalle
        tipo: 'reclamo',
        detalle: '',
        solucion_esperada: '',
        solucion_otra: '',
        pedido: '',
        // 5. Adjuntos
        fotos: [],
        comprobante_archivo: null,
        video: null,
        // 6. Confirmación
        declara_veracidad: false,
        acepta_politica: false,
        conforme: false,
    });
    const { data, setData, errors, processing, progress } = form;

    const campo = (nombre, props = {}) => ({
        id: nombre,
        value: data[nombre],
        onChange: (e) => setData(nombre, e.target.value),
        error: errors[nombre],
        ...props,
    });

    const errorFotos = errors.fotos ?? Object.entries(errors).find(([clave]) => clave.startsWith('fotos.'))?.[1];
    const opcionesDocumento = tiposDocumento.map((t) => ({ value: t, label: t }));
    const ahora = useAhora();
    const fechaLimite = sumarDiasHabiles(ahora, diasRespuesta);

    const enviar = (e) => {
        e.preventDefault();
        // La API devuelve el enlace firmado a la constancia (solo lo ve quien registró la hoja)
        form.post('/reclamaciones', { recargar: false, avisar: false, onSuccess: (respuesta) => router.visit(respuesta.data.constancia_url) });
    };

    return (
        <PublicLayout title="Libro de Reclamaciones" description="Registra tu reclamo o queja en nuestro Libro de Reclamaciones virtual.">
            <div className="bg-primary-50 py-6 sm:py-8 lg:py-10">
                <Container className="flex flex-col gap-6">
                    <LibroEncabezado subtitulo="Registra tu reclamo o queja y te daremos una respuesta." />

                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
                        <form onSubmit={enviar} className="flex min-w-0 flex-col gap-6" noValidate>
                            <Bloque numero="1" titulo="Datos del consumidor" className="xl:grid-cols-3">
                                <FormField label="Nombres y apellidos" htmlFor="nombre" error={errors.nombre} required className="sm:col-span-2 xl:col-span-1">
                                    <Input {...campo('nombre', { autoComplete: 'name', placeholder: 'Ej.: Juan Carlos Pérez López' })} />
                                </FormField>
                                <FormField label="Tipo de documento" htmlFor="tipo_documento" error={errors.tipo_documento} required>
                                    <Select {...campo('tipo_documento')} options={opcionesDocumento} />
                                </FormField>
                                <FormField
                                    label="Número de documento"
                                    htmlFor="numero_documento"
                                    error={errors.numero_documento}
                                    required
                                    hint={AYUDA_DOCUMENTO[data.tipo_documento]}
                                >
                                    <Input
                                        {...campo('numero_documento', {
                                            placeholder: data.tipo_documento === 'DNI' ? 'Ej.: 12345678' : undefined,
                                            inputMode: LONGITUD_DOCUMENTO[data.tipo_documento] ? 'numeric' : undefined,
                                            maxLength: LONGITUD_DOCUMENTO[data.tipo_documento] ?? 12,
                                        })}
                                    />
                                </FormField>
                                <FormField label="Celular" htmlFor="telefono" error={errors.telefono} required hint="9 dígitos, empezando en 9.">
                                    <ConIcono icon={Smartphone}>
                                        <Input
                                            {...campo('telefono', {
                                                type: 'tel',
                                                inputMode: 'numeric',
                                                maxLength: 11,
                                                autoComplete: 'tel',
                                                placeholder: 'Ej.: 987654321',
                                                className: 'pl-10',
                                            })}
                                        />
                                    </ConIcono>
                                </FormField>
                                <FormField label="Correo electrónico" htmlFor="email" error={errors.email} required hint="Aquí te enviaremos la copia y la respuesta.">
                                    <ConIcono icon={Mail}>
                                        <Input {...campo('email', { type: 'email', autoComplete: 'email', placeholder: 'correo@ejemplo.com', className: 'pl-10' })} />
                                    </ConIcono>
                                </FormField>
                                <FormField label="Dirección" htmlFor="domicilio" error={errors.domicilio} required className="sm:col-span-2 xl:col-span-1">
                                    <Input {...campo('domicilio', { autoComplete: 'street-address', placeholder: 'Ej.: Av. Ejército 123, Yanahuara' })} />
                                </FormField>
                                <Checkbox
                                    id="menor_de_edad"
                                    checked={data.menor_de_edad}
                                    onChange={(valor) => setData('menor_de_edad', valor)}
                                    className="sm:col-span-2 xl:col-span-3"
                                >
                                    El consumidor es menor de edad (se piden los datos del apoderado)
                                </Checkbox>
                                {data.menor_de_edad && (
                                    <div className="grid gap-5 rounded-xl bg-primary-50 p-4 sm:col-span-2 sm:grid-cols-2 xl:col-span-3 xl:grid-cols-3">
                                        <FormField
                                            label="Nombre del padre, madre o apoderado"
                                            htmlFor="apoderado"
                                            error={errors.apoderado}
                                            required
                                            className="sm:col-span-2 xl:col-span-1"
                                        >
                                            <Input {...campo('apoderado')} />
                                        </FormField>
                                        <FormField label="Tipo de documento" htmlFor="apoderado_tipo_documento" error={errors.apoderado_tipo_documento} required>
                                            <Select {...campo('apoderado_tipo_documento')} options={opcionesDocumento} />
                                        </FormField>
                                        <FormField
                                            label="Número de documento"
                                            htmlFor="apoderado_numero_documento"
                                            error={errors.apoderado_numero_documento}
                                            required
                                            hint={AYUDA_DOCUMENTO[data.apoderado_tipo_documento]}
                                        >
                                            <Input {...campo('apoderado_numero_documento', { maxLength: LONGITUD_DOCUMENTO[data.apoderado_tipo_documento] ?? 12 })} />
                                        </FormField>
                                    </div>
                                )}
                            </Bloque>

                            <Bloque
                                numero="2"
                                titulo="Información de la compra"
                                descripcion="Completa lo que tengas a la mano; solo lo marcado con * es obligatorio."
                                className="xl:grid-cols-3"
                            >
                                <FormField label="Tipo de comprobante" htmlFor="comprobante_tipo" error={errors.comprobante_tipo}>
                                    <Select
                                        {...campo('comprobante_tipo')}
                                        placeholder="Seleccionar"
                                        options={Object.entries(tiposComprobante).map(([value, label]) => ({ value, label }))}
                                    />
                                </FormField>
                                <FormField label="Número de comprobante" htmlFor="comprobante_numero" error={errors.comprobante_numero}>
                                    <Input {...campo('comprobante_numero', { placeholder: 'Ej.: B001-00012345' })} />
                                </FormField>
                                <FormField label="Fecha de compra" htmlFor="fecha_compra" error={errors.fecha_compra}>
                                    <Input {...campo('fecha_compra', { type: 'date', max: new Date().toISOString().slice(0, 10) })} />
                                </FormField>
                                <FormField label="Código de asociado o N° de contrato" htmlFor="numero_contrato" error={errors.numero_contrato}>
                                    <Input {...campo('numero_contrato', { placeholder: 'Ej.: CG-000123' })} />
                                </FormField>
                                <FormField label="Código del producto" htmlFor="producto_codigo" error={errors.producto_codigo}>
                                    <Input {...campo('producto_codigo', { placeholder: 'Ej.: placa ABC-123 o IMEI' })} />
                                </FormField>
                                <FormField label="Nombre del producto" htmlFor="producto_nombre" error={errors.producto_nombre}>
                                    <Input {...campo('producto_nombre', { placeholder: 'Ej.: Auto sedán / Celular' })} />
                                </FormField>
                                <FormField label="Marca" htmlFor="producto_marca" error={errors.producto_marca}>
                                    <Input {...campo('producto_marca', { placeholder: 'Ej.: Toyota' })} />
                                </FormField>
                                <FormField label="Modelo" htmlFor="producto_modelo" error={errors.producto_modelo}>
                                    <Input {...campo('producto_modelo', { placeholder: 'Ej.: Yaris 2024' })} />
                                </FormField>
                                <FormField label="Tipo de bien" htmlFor="tipo_bien" error={errors.tipo_bien} required>
                                    <Select
                                        {...campo('tipo_bien')}
                                        options={[
                                            { value: 'producto', label: 'Producto' },
                                            { value: 'servicio', label: 'Servicio' },
                                        ]}
                                    />
                                </FormField>
                                <FormField label="Monto reclamado (S/)" htmlFor="monto_reclamado" error={errors.monto_reclamado} required>
                                    <Input {...campo('monto_reclamado', { type: 'number', min: 0, step: '0.01', inputMode: 'decimal', placeholder: '0.00' })} />
                                </FormField>
                                <FormField
                                    label="Descripción del producto o servicio"
                                    htmlFor="descripcion_bien"
                                    error={errors.descripcion_bien}
                                    required
                                    className="sm:col-span-2"
                                >
                                    <Textarea {...campo('descripcion_bien', { rows: 2, placeholder: 'Describe brevemente qué contrataste o compraste' })} />
                                </FormField>
                            </Bloque>

                            <Bloque numero="3" titulo="Tipo de registro">
                                <OpcionTipo
                                    valor="reclamo"
                                    actual={data.tipo}
                                    onChange={(v) => setData('tipo', v)}
                                    titulo="Reclamo"
                                    descripcion="Disconformidad relacionada con el producto o servicio."
                                />
                                <OpcionTipo
                                    valor="queja"
                                    actual={data.tipo}
                                    onChange={(v) => setData('tipo', v)}
                                    titulo="Queja"
                                    descripcion="Disconformidad relacionada con la atención recibida."
                                />
                                {errors.tipo && <p className="text-sm text-red-600 sm:col-span-2">{errors.tipo}</p>}
                            </Bloque>

                            <Bloque numero="4" titulo="Detalle">
                                <FormField
                                    label="Detalle del reclamo o queja"
                                    htmlFor="detalle"
                                    error={errors.detalle}
                                    required
                                    hint="Mínimo 20 caracteres."
                                    className="sm:col-span-2"
                                >
                                    <Textarea {...campo('detalle', { rows: 5, placeholder: 'Describe aquí tu reclamo o queja con el mayor detalle posible...' })} />
                                </FormField>
                                <FormField label="¿Qué solución espera?" htmlFor="solucion_esperada" error={errors.solucion_esperada}>
                                    <Select
                                        {...campo('solucion_esperada')}
                                        placeholder="Seleccionar solución esperada"
                                        options={Object.entries(soluciones).map(([value, label]) => ({ value, label }))}
                                    />
                                </FormField>
                                {data.solucion_esperada === 'otra' ? (
                                    <FormField label="Otra solución (especifique)" htmlFor="solucion_otra" error={errors.solucion_otra} required>
                                        <Input {...campo('solucion_otra', { placeholder: 'Escribe aquí la solución que esperas' })} />
                                    </FormField>
                                ) : (
                                    <div className="hidden sm:block" />
                                )}
                                <FormField label="Pedido concreto del consumidor" htmlFor="pedido" error={errors.pedido} required hint="Mínimo 10 caracteres." className="sm:col-span-2">
                                    <Textarea {...campo('pedido', { rows: 3, placeholder: 'Indica qué solicitas a la empresa' })} />
                                </FormField>
                            </Bloque>

                            <Bloque
                                numero="5"
                                titulo="Información adicional"
                                opcional
                                descripcion="Puedes adjuntar archivos que nos ayuden a entender mejor tu caso."
                                className="sm:grid-cols-3"
                            >
                                <ArchivoInput
                                    id="fotos"
                                    icon={ImagePlus}
                                    titulo="Adjuntar fotografías"
                                    formatos="JPG, PNG (máx. 5 MB c/u, hasta 5)"
                                    accept="image/jpeg,image/png"
                                    maxMb={5}
                                    multiple
                                    value={data.fotos}
                                    onChange={(archivos) => setData('fotos', archivos)}
                                    error={errorFotos}
                                />
                                <ArchivoInput
                                    id="comprobante_archivo"
                                    icon={FileText}
                                    titulo="Adjuntar factura"
                                    formatos="PDF, JPG, PNG (máx. 5 MB)"
                                    accept="application/pdf,image/jpeg,image/png"
                                    maxMb={5}
                                    value={data.comprobante_archivo}
                                    onChange={(archivo) => setData('comprobante_archivo', archivo)}
                                    error={errors.comprobante_archivo}
                                />
                                <ArchivoInput
                                    id="video"
                                    icon={Video}
                                    titulo="Adjuntar video"
                                    formatos="MP4 (máx. 20 MB)"
                                    accept="video/mp4"
                                    maxMb={20}
                                    value={data.video}
                                    onChange={(archivo) => setData('video', archivo)}
                                    error={errors.video}
                                />
                            </Bloque>

                            <Bloque numero="6" titulo="Confirmación" className="sm:grid-cols-1">
                                <div className="flex flex-col gap-3">
                                    <Checkbox id="declara_veracidad" checked={data.declara_veracidad} onChange={(v) => setData('declara_veracidad', v)} error={errors.declara_veracidad}>
                                        Declaro que la información proporcionada es verdadera.
                                    </Checkbox>
                                    <Checkbox id="acepta_politica" checked={data.acepta_politica} onChange={(v) => setData('acepta_politica', v)} error={errors.acepta_politica}>
                                        Acepto el tratamiento de mis datos personales de acuerdo con la Ley de Protección de Datos Personales y la{' '}
                                        <a
                                            href="/politica-de-privacidad"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-semibold text-primary underline underline-offset-2"
                                        >
                                            política de privacidad
                                        </a>
                                        .
                                    </Checkbox>
                                    <Checkbox id="conforme" checked={data.conforme} onChange={(v) => setData('conforme', v)} error={errors.conforme}>
                                        He leído y estoy conforme con el contenido de mi reclamo.
                                    </Checkbox>
                                </div>

                                <div className="flex gap-3 rounded-xl bg-primary-50 p-4 text-sm text-primary-700">
                                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-primary-500" aria-hidden="true" />
                                    <p>
                                        La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para
                                        interponer una denuncia ante el INDECOPI. El proveedor deberá responder en un plazo no mayor a {diasRespuesta} días
                                        hábiles.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 border-t border-primary-100 pt-5">
                                    {Object.keys(errors).length > 0 && (
                                        <p className="text-sm font-medium text-red-600" role="alert">
                                            Revisa los campos marcados en rojo.
                                        </p>
                                    )}
                                    {progress && (
                                        <div
                                            className="h-2 overflow-hidden rounded-full bg-primary-100"
                                            role="progressbar"
                                            aria-valuenow={progress.percentage}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                        >
                                            <div className="h-full bg-primary transition-all" style={{ width: `${progress.percentage}%` }} />
                                        </div>
                                    )}
                                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-sm text-primary-500">
                                            Los campos con <span className="text-red-600">*</span> son obligatorios.
                                        </p>
                                        <Button type="submit" variant="secondary" size="lg" icon={Send} disabled={processing}>
                                            {processing ? (progress ? `Subiendo archivos... ${progress.percentage}%` : 'Enviando...') : 'Enviar hoja de reclamación'}
                                        </Button>
                                    </div>
                                </div>
                            </Bloque>
                        </form>

                        <aside className="flex flex-col gap-6 lg:self-stretch">
                            <TarjetaLateral icon={ClipboardList} titulo="Información automática">
                                <dl>
                                    <DatoLateral etiqueta="N.º de reclamación">
                                        <span className="font-medium text-primary-400 italic">Se asigna al enviar</span>
                                    </DatoLateral>
                                    <DatoLateral etiqueta="Fecha y hora">{formatoFecha(ahora)}</DatoLateral>
                                    <DatoLateral etiqueta="Canal">Web · {window.location.host}</DatoLateral>
                                    <DatoLateral etiqueta="Estado">
                                        <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-primary">Pendiente</span>
                                    </DatoLateral>
                                    <DatoLateral etiqueta="Responsable asignado">
                                        <span className="font-medium text-primary-400 italic">Por asignar</span>
                                    </DatoLateral>
                                    <DatoLateral etiqueta="Fecha límite de respuesta">
                                        {diasRespuesta} días hábiles
                                        <span className="block text-xs font-normal text-primary-500">hasta el {formatoFecha(fechaLimite, false)}</span>
                                    </DatoLateral>
                                </dl>
                                <div className="mt-4 rounded-xl bg-primary-50 p-4 text-sm">
                                    <p className="mb-1 text-xs font-bold tracking-wider text-primary-500 uppercase">Proveedor</p>
                                    <p className="font-semibold text-primary">{sitio.empresa_razon_social || sitio.empresa_nombre}</p>
                                    {sitio.empresa_ruc && <p className="text-primary-700/80">RUC {sitio.empresa_ruc}</p>}
                                    {sitio.contacto_direccion && (
                                        <p className="text-primary-700/80">{[sitio.contacto_direccion, sitio.contacto_ciudad].filter(Boolean).join(', ')}</p>
                                    )}
                                </div>
                            </TarjetaLateral>

                            {/* Al bajar, "Importante" y la ayuda quedan a la vista */}
                            <div className="flex flex-col gap-6 lg:sticky lg:top-24">
                                <TarjetaLateral icon={CircleAlert} titulo="Importante" oscura>
                                    <ul className="flex flex-col gap-3 text-sm text-white/85">
                                        <li className="flex gap-2.5">
                                            <CircleCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                                            <span>
                                                Tu reclamo será atendido en un plazo máximo de <strong className="text-white">{diasRespuesta} días hábiles</strong>.
                                            </span>
                                        </li>
                                        <li className="flex gap-2.5">
                                            <CircleCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                                            <span>Recibirás una copia de tu hoja y la respuesta en tu correo electrónico.</span>
                                        </li>
                                        <li className="flex gap-2.5">
                                            <CircleCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                                            <span>Puedes hacer seguimiento con tu número de reclamación y tu documento.</span>
                                        </li>
                                    </ul>
                                    <Link
                                        href="/libro-de-reclamaciones/consultar"
                                        className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-primary transition hover:brightness-95"
                                    >
                                        <Search className="size-4" aria-hidden="true" /> Consultar mi reclamo
                                    </Link>
                                </TarjetaLateral>

                                <AyudaLateral />
                            </div>
                        </aside>
                    </div>
                </Container>
            </div>
        </PublicLayout>
    );
}

/** Libro de Reclamaciones: el contenido llega de la API (GET /api/paginas/libro-de-reclamaciones). */
export default function LibroReclamaciones() {
    return <PaginaApi url="/paginas/libro-de-reclamaciones">{(datos) => <LibroReclamacionesContenido {...datos} />}</PaginaApi>;
}
