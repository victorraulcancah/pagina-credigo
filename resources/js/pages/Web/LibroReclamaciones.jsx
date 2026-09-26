import { useForm } from '@inertiajs/react';
import { BookOpenText, Send } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import AceptaPolitica from '@/components/web/AceptaPolitica';
import Checkbox from '@/components/ui/Checkbox';
import Section from '@/components/ui/Section';
import { useSitio } from '@/hooks/useSitio';
import { formatoFecha } from '@/lib/fechas';
import { cn } from '@/lib/utils';

function Bloque({ numero, titulo, children }) {
    return (
        <fieldset className="grid gap-5 sm:grid-cols-2">
            <legend className="mb-4 flex items-center gap-3 text-lg font-bold text-primary sm:col-span-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm text-accent">{numero}</span>
                {titulo}
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
export default function LibroReclamaciones({ tiposDocumento, diasRespuesta }) {
    const sitio = useSitio();
    const form = useForm({
        tipo: 'reclamo',
        nombre: '',
        tipo_documento: 'DNI',
        numero_documento: '',
        domicilio: '',
        telefono: '',
        email: '',
        menor_de_edad: false,
        apoderado: '',
        tipo_bien: 'servicio',
        monto_reclamado: '',
        descripcion_bien: '',
        detalle: '',
        pedido: '',
        acepta_politica: false,
    });
    const { data, setData, errors, processing } = form;

    const campo = (nombre, props = {}) => ({
        id: nombre,
        value: data[nombre],
        onChange: (e) => setData(nombre, e.target.value),
        error: errors[nombre],
        ...props,
    });

    const enviar = (e) => {
        e.preventDefault();
        form.post('/libro-de-reclamaciones', { preserveScroll: true });
    };

    return (
        <PublicLayout title="Libro de Reclamaciones" description="Registra tu reclamo o queja en nuestro Libro de Reclamaciones virtual.">
            <PageHero
                eyebrow="Indecopi"
                title="Libro de Reclamaciones"
                description="Conforme al Código de Protección y Defensa del Consumidor, ponemos a tu disposición nuestro Libro de Reclamaciones virtual."
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
                                    <p className="text-sm text-primary-700/80">
                                        {[sitio.contacto_direccion, sitio.contacto_ciudad].filter(Boolean).join(', ')}
                                    </p>
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
                        <form onSubmit={enviar} className="flex flex-col gap-10" noValidate>
                            <Bloque numero="1" titulo="Identificación del consumidor reclamante">
                                <FormField label="Nombre completo" htmlFor="nombre" error={errors.nombre} required className="sm:col-span-2">
                                    <Input {...campo('nombre', { autoComplete: 'name' })} />
                                </FormField>
                                <FormField label="Tipo de documento" htmlFor="tipo_documento" error={errors.tipo_documento} required>
                                    <Select {...campo('tipo_documento')} options={tiposDocumento.map((t) => ({ value: t, label: t }))} />
                                </FormField>
                                <FormField label="Número de documento" htmlFor="numero_documento" error={errors.numero_documento} required>
                                    <Input {...campo('numero_documento', { inputMode: 'numeric' })} />
                                </FormField>
                                <FormField label="Domicilio" htmlFor="domicilio" error={errors.domicilio} required className="sm:col-span-2">
                                    <Input {...campo('domicilio', { autoComplete: 'street-address' })} />
                                </FormField>
                                <FormField label="Teléfono" htmlFor="telefono" error={errors.telefono} required>
                                    <Input {...campo('telefono', { type: 'tel', autoComplete: 'tel' })} />
                                </FormField>
                                <FormField label="Correo" htmlFor="email" error={errors.email} required hint="Aquí te enviaremos la copia y la respuesta.">
                                    <Input {...campo('email', { type: 'email', autoComplete: 'email' })} />
                                </FormField>
                                <Checkbox
                                    id="menor_de_edad"
                                    checked={data.menor_de_edad}
                                    onChange={(valor) => setData('menor_de_edad', valor)}
                                    className="sm:col-span-2"
                                >
                                    Soy menor de edad
                                </Checkbox>
                                {data.menor_de_edad && (
                                    <FormField label="Nombre del padre, madre o tutor" htmlFor="apoderado" error={errors.apoderado} required className="sm:col-span-2">
                                        <Input {...campo('apoderado')} />
                                    </FormField>
                                )}
                            </Bloque>

                            <Bloque numero="2" titulo="Identificación del bien contratado">
                                <FormField label="Tipo" htmlFor="tipo_bien" error={errors.tipo_bien} required>
                                    <Select
                                        {...campo('tipo_bien')}
                                        options={[
                                            { value: 'servicio', label: 'Servicio' },
                                            { value: 'producto', label: 'Producto' },
                                        ]}
                                    />
                                </FormField>
                                <FormField label="Monto reclamado (S/)" htmlFor="monto_reclamado" error={errors.monto_reclamado} hint="Opcional">
                                    <Input {...campo('monto_reclamado', { type: 'number', min: 0, step: '0.01', inputMode: 'decimal' })} />
                                </FormField>
                                <FormField label="Descripción del producto o servicio" htmlFor="descripcion_bien" error={errors.descripcion_bien} required className="sm:col-span-2">
                                    <Textarea {...campo('descripcion_bien', { rows: 2 })} placeholder="Ej. Plan CrediYango, contrato N°..." />
                                </FormField>
                            </Bloque>

                            <Bloque numero="3" titulo="Detalle de la reclamación">
                                <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
                                    <OpcionTipo
                                        valor="reclamo"
                                        actual={data.tipo}
                                        onChange={(v) => setData('tipo', v)}
                                        titulo="Reclamo"
                                        descripcion="Disconformidad relacionada con los productos o servicios."
                                    />
                                    <OpcionTipo
                                        valor="queja"
                                        actual={data.tipo}
                                        onChange={(v) => setData('tipo', v)}
                                        titulo="Queja"
                                        descripcion="Disconformidad no relacionada con los productos o servicios, o malestar por la atención al público."
                                    />
                                    {errors.tipo && <p className="text-sm text-red-600 sm:col-span-2">{errors.tipo}</p>}
                                </div>
                                <FormField label="Detalle" htmlFor="detalle" error={errors.detalle} required className="sm:col-span-2">
                                    <Textarea {...campo('detalle', { rows: 5 })} placeholder="Describe lo ocurrido" />
                                </FormField>
                                <FormField label="Pedido" htmlFor="pedido" error={errors.pedido} required className="sm:col-span-2">
                                    <Textarea {...campo('pedido', { rows: 3 })} placeholder="¿Qué solución esperas?" />
                                </FormField>
                            </Bloque>

                            <div className="flex flex-col gap-4 rounded-xl bg-primary-50 p-4 text-sm text-primary-700 sm:p-5">
                                <p>
                                    La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para
                                    interponer una denuncia ante el INDECOPI.
                                </p>
                                <p>
                                    El proveedor deberá dar respuesta al reclamo o queja en un plazo no mayor a {diasRespuesta} días hábiles. La respuesta
                                    se enviará al correo que indiques.
                                </p>
                            </div>

                            <AceptaPolitica checked={data.acepta_politica} onChange={(valor) => setData('acepta_politica', valor)} error={errors.acepta_politica} />

                            <Button type="submit" variant="secondary" size="lg" icon={Send} disabled={processing} className="self-start">
                                {processing ? 'Enviando...' : 'Enviar hoja de reclamación'}
                            </Button>
                        </form>
                    </Card>
                </div>
            </Section>
        </PublicLayout>
    );
}
