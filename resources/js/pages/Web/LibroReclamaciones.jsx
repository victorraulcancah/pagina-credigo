import { useForm } from '@inertiajs/react';
import { BookOpenText, FileText, ImagePlus, Send, Video } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import ArchivoInput from '@/components/ui/ArchivoInput';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Checkbox from '@/components/ui/Checkbox';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Section from '@/components/ui/Section';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { useSitio } from '@/hooks/useSitio';
import { formatoFecha } from '@/lib/fechas';
import { cn } from '@/lib/utils';

const LONGITUD_DOCUMENTO = { DNI: 8, RUC: 11 };
const AYUDA_DOCUMENTO = { DNI: 'El DNI debe tener 8 dígitos.', RUC: 'El RUC debe tener 11 dígitos.' };

function Bloque({ numero, titulo, descripcion, opcional = false, children }) {
    return (
        <fieldset className="grid gap-5 sm:grid-cols-2">
            <legend className="mb-5 w-full border-b border-primary-100 pb-4">
                <span className="flex items-center gap-3 text-base font-bold tracking-wide text-primary uppercase sm:text-lg">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-accent">{numero}</span>
                    {titulo}
                    {opcional && <span className="text-xs font-medium tracking-normal text-primary-400 normal-case sm:text-sm">(opcional)</span>}
                </span>
                {descripcion && <span className="mt-2 block text-sm text-primary-700/80 sm:pl-11">{descripcion}</span>}
            </legend>
            {children}
        </fieldset>
    );
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
export default function LibroReclamaciones({ tiposDocumento, tiposComprobante, soluciones, diasRespuesta }) {
    const sitio = useSitio();
    const form = useForm({
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

    const enviar = (e) => {
        e.preventDefault();
        form.post('/libro-de-reclamaciones', { preserveScroll: true, forceFormData: true });
    };

    return (
        <PublicLayout title="Libro de Reclamaciones" description="Registra tu reclamo o queja en nuestro Libro de Reclamaciones virtual.">
            <PageHero
                eyebrow="Libro de Reclamaciones"
                title="Registra tu reclamo o queja y te daremos una respuesta"
                description="Cumplimos con la normativa del Código de Protección y Defensa del Consumidor (Indecopi)."
            />

            <Section background="muted">
                <div className="mx-auto max-w-4xl">
                    <Card className="mb-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-3">
                                <BookOpenText className="mt-1 size-8 shrink-0 text-primary" aria-hidden="true" />
                                <div>
                                    <p className="text-lg font-bold text-primary">{sitio.empresa_razon_social || sitio.empresa_nombre}</p>
                                    {sitio.empresa_ruc && <p className="text-sm text-primary-700/80">RUC {sitio.empresa_ruc}</p>}
                                    <p className="text-sm text-primary-700/80">{[sitio.contacto_direccion, sitio.contacto_ciudad].filter(Boolean).join(', ')}</p>
                                </div>
                            </div>
                            <div className="text-sm text-primary-700/80 sm:text-right">
                                <p>
                                    Fecha: <span className="font-semibold text-primary">{formatoFecha(new Date(), false)}</span>
                                </p>
                                <p>El número de hoja se genera al enviar.</p>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <form onSubmit={enviar} className="flex flex-col gap-12" noValidate>
                            <Bloque numero="1" titulo="Datos del consumidor">
                                <FormField label="Nombres y apellidos" htmlFor="nombre" error={errors.nombre} required className="sm:col-span-2">
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
                                <FormField label="Teléfono" htmlFor="telefono" error={errors.telefono} required hint="Celular de 9 dígitos, empezando en 9.">
                                    <Input {...campo('telefono', { type: 'tel', inputMode: 'numeric', maxLength: 11, autoComplete: 'tel', placeholder: 'Ej.: 987654321' })} />
                                </FormField>
                                <FormField label="Correo electrónico" htmlFor="email" error={errors.email} required hint="Aquí te enviaremos la copia y la respuesta.">
                                    <Input {...campo('email', { type: 'email', autoComplete: 'email', placeholder: 'Ej.: correo@ejemplo.com' })} />
                                </FormField>
                                <FormField label="Dirección" htmlFor="domicilio" error={errors.domicilio} required className="sm:col-span-2">
                                    <Input {...campo('domicilio', { autoComplete: 'street-address', placeholder: 'Ej.: Av. Ejército 123, Yanahuara, Arequipa' })} />
                                </FormField>
                                <Checkbox id="menor_de_edad" checked={data.menor_de_edad} onChange={(valor) => setData('menor_de_edad', valor)} className="sm:col-span-2">
                                    El consumidor es menor de edad (se piden los datos del apoderado)
                                </Checkbox>
                                {data.menor_de_edad && (
                                    <div className="grid gap-5 rounded-xl bg-primary-50 p-4 sm:col-span-2 sm:grid-cols-2">
                                        <FormField label="Nombre del padre, madre o apoderado" htmlFor="apoderado" error={errors.apoderado} required className="sm:col-span-2">
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

                            <Bloque numero="2" titulo="Información de la compra" descripcion="Completa lo que tengas a la mano; solo lo marcado con * es obligatorio.">
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
                                    <Input {...campo('producto_nombre', { placeholder: 'Ej.: Auto sedán / Celular Redmi 14' })} />
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
                                <FormField label="Descripción del producto o servicio" htmlFor="descripcion_bien" error={errors.descripcion_bien} required className="sm:col-span-2">
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
                                <FormField label="Detalle del reclamo o queja" htmlFor="detalle" error={errors.detalle} required hint="Mínimo 20 caracteres." className="sm:col-span-2">
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

                            <Bloque numero="5" titulo="Información adicional" opcional descripcion="Puedes adjuntar archivos que nos ayuden a entender mejor tu caso.">
                                <div className="grid gap-4 sm:col-span-2 md:grid-cols-3">
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
                                </div>
                            </Bloque>

                            <Bloque numero="6" titulo="Confirmación">
                                <div className="flex flex-col gap-3 sm:col-span-2">
                                    <Checkbox id="declara_veracidad" checked={data.declara_veracidad} onChange={(v) => setData('declara_veracidad', v)} error={errors.declara_veracidad}>
                                        Declaro que la información proporcionada es verdadera.
                                    </Checkbox>
                                    <Checkbox id="acepta_politica" checked={data.acepta_politica} onChange={(v) => setData('acepta_politica', v)} error={errors.acepta_politica}>
                                        Acepto el tratamiento de mis datos personales de acuerdo con la Ley de Protección de Datos Personales y la{' '}
                                        <a href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-2">
                                            política de privacidad
                                        </a>
                                        .
                                    </Checkbox>
                                    <Checkbox id="conforme" checked={data.conforme} onChange={(v) => setData('conforme', v)} error={errors.conforme}>
                                        He leído y estoy conforme con el contenido de mi reclamo.
                                    </Checkbox>
                                </div>
                            </Bloque>

                            <div className="flex flex-col gap-3 rounded-xl bg-primary-50 p-4 text-sm text-primary-700 sm:p-5">
                                <p>
                                    La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para
                                    interponer una denuncia ante el INDECOPI.
                                </p>
                                <p>
                                    El proveedor deberá dar respuesta al reclamo o queja en un plazo no mayor a {diasRespuesta} días hábiles. La respuesta
                                    se enviará al correo que indiques.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                {Object.keys(errors).length > 0 && (
                                    <p className="text-sm font-medium text-red-600" role="alert">
                                        Revisa los campos marcados en rojo.
                                    </p>
                                )}
                                {progress && (
                                    <div className="h-2 overflow-hidden rounded-full bg-primary-100" role="progressbar" aria-valuenow={progress.percentage} aria-valuemin={0} aria-valuemax={100}>
                                        <div className="h-full bg-primary transition-all" style={{ width: `${progress.percentage}%` }} />
                                    </div>
                                )}
                                <Button type="submit" variant="secondary" size="lg" icon={Send} disabled={processing} className="self-start">
                                    {processing ? (progress ? `Subiendo archivos... ${progress.percentage}%` : 'Enviando...') : 'Enviar hoja de reclamación'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </Section>
        </PublicLayout>
    );
}
