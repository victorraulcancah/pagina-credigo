import { Save } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import PantallaApi from '@/components/admin/PantallaApi';
import Panel from '@/components/admin/Panel';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { useFormApi } from '@/hooks/useFormApi';

const CAMPOS = [
    'empresa_nombre', 'empresa_razon_social', 'empresa_ruc', 'empresa_eslogan', 'empresa_descripcion',
    'contacto_telefono', 'contacto_whatsapp', 'contacto_whatsapp_mensaje', 'contacto_email',
    'contacto_direccion', 'contacto_ciudad', 'contacto_horario', 'contacto_mapa_url',
    'redes_facebook', 'redes_instagram', 'redes_tiktok', 'redes_youtube',
    'notificaciones_email',
];

function EmpresaFormulario({ ajustes }) {
    const { data, setData, put, processing, errors, isDirty, setDefaults } = useFormApi(
        Object.fromEntries(CAMPOS.map((campo) => [campo, ajustes[campo] ?? ''])),
    );

    const campo = (nombre, props = {}) => ({
        id: nombre,
        value: data[nombre],
        onChange: (e) => setData(nombre, e.target.value),
        error: errors[nombre],
        ...props,
    });

    const guardar = (e) => {
        e.preventDefault();
        put('/admin/configuracion', { onSuccess: () => setDefaults() });
    };

    const botonGuardar = (
        <Button type="submit" form="form-empresa" variant="secondary" icon={Save} disabled={processing || !isDirty}>
            {processing ? 'Guardando...' : 'Guardar cambios'}
        </Button>
    );

    return (
        <AdminLayout title="Empresa y contacto">
            <PageHeader
                title="Empresa y contacto"
                description="Datos que se muestran en el pie de página, la página de contacto y el botón de WhatsApp."
                actions={botonGuardar}
            />

            <form id="form-empresa" onSubmit={guardar} className="flex flex-col gap-6">
                <Panel title="Empresa">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField label="Nombre comercial" htmlFor="empresa_nombre" error={errors.empresa_nombre} required>
                            <Input {...campo('empresa_nombre')} />
                        </FormField>
                        <FormField label="Eslogan" htmlFor="empresa_eslogan" error={errors.empresa_eslogan} hint="Aparece sobre el título del banner principal.">
                            <Input {...campo('empresa_eslogan')} />
                        </FormField>
                        <FormField label="Razón social" htmlFor="empresa_razon_social" error={errors.empresa_razon_social}>
                            <Input {...campo('empresa_razon_social')} />
                        </FormField>
                        <FormField label="RUC" htmlFor="empresa_ruc" error={errors.empresa_ruc}>
                            <Input {...campo('empresa_ruc', { inputMode: 'numeric', maxLength: 11 })} />
                        </FormField>
                        <FormField
                            label="Descripción"
                            htmlFor="empresa_descripcion"
                            error={errors.empresa_descripcion}
                            hint="Se usa en el pie de página y como descripción para Google."
                            className="sm:col-span-2"
                        >
                            <Textarea {...campo('empresa_descripcion', { rows: 3 })} />
                        </FormField>
                    </div>
                </Panel>

                <Panel title="Contacto">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField label="Teléfono" htmlFor="contacto_telefono" error={errors.contacto_telefono}>
                            <Input {...campo('contacto_telefono', { type: 'tel' })} />
                        </FormField>
                        <FormField
                            label="WhatsApp"
                            htmlFor="contacto_whatsapp"
                            error={errors.contacto_whatsapp}
                            hint="Solo números con código de país. Ej. 51987654321"
                        >
                            <Input {...campo('contacto_whatsapp', { inputMode: 'numeric' })} />
                        </FormField>
                        <FormField
                            label="Mensaje inicial de WhatsApp"
                            htmlFor="contacto_whatsapp_mensaje"
                            error={errors.contacto_whatsapp_mensaje}
                            className="sm:col-span-2"
                        >
                            <Input {...campo('contacto_whatsapp_mensaje')} />
                        </FormField>
                        <FormField label="Correo" htmlFor="contacto_email" error={errors.contacto_email}>
                            <Input {...campo('contacto_email', { type: 'email' })} />
                        </FormField>
                        <FormField label="Horario de atención" htmlFor="contacto_horario" error={errors.contacto_horario} hint="Ej. Lunes a sábado de 9:00 a. m. a 6:00 p. m.">
                            <Input {...campo('contacto_horario')} />
                        </FormField>
                        <FormField label="Dirección" htmlFor="contacto_direccion" error={errors.contacto_direccion}>
                            <Input {...campo('contacto_direccion')} />
                        </FormField>
                        <FormField label="Distrito / ciudad" htmlFor="contacto_ciudad" error={errors.contacto_ciudad}>
                            <Input {...campo('contacto_ciudad')} />
                        </FormField>
                        <FormField
                            label="Mapa de Google"
                            htmlFor="contacto_mapa_url"
                            error={errors.contacto_mapa_url}
                            hint='En Google Maps: Compartir → "Insertar un mapa" → copia el código y pégalo aquí.'
                            className="sm:col-span-2"
                        >
                            <Textarea {...campo('contacto_mapa_url', { rows: 2 })} />
                        </FormField>
                    </div>
                </Panel>

                <Panel
                    title="Avisos por correo"
                    description="Quién recibe un correo cuando llega una solicitud (contacto o cotizador) o una hoja del Libro de Reclamaciones. No se muestra en la web."
                >
                    <FormField
                        label="Correos del equipo"
                        htmlFor="notificaciones_email"
                        error={errors.notificaciones_email}
                        hint="Separa varios correos con comas. Si lo dejas vacío, los avisos van al correo de contacto."
                    >
                        <Input {...campo('notificaciones_email', { placeholder: 'ventas@credigo.com, gerencia@credigo.com' })} />
                    </FormField>
                </Panel>

                <Panel title="Redes sociales" description="Pega el enlace completo. Las que dejes vacías no se muestran.">
                    <div className="grid gap-5 sm:grid-cols-2">
                        {[
                            ['redes_facebook', 'Facebook'],
                            ['redes_instagram', 'Instagram'],
                            ['redes_tiktok', 'TikTok'],
                            ['redes_youtube', 'YouTube'],
                        ].map(([nombre, label]) => (
                            <FormField key={nombre} label={label} htmlFor={nombre} error={errors[nombre]}>
                                <Input {...campo(nombre, { type: 'url', placeholder: 'https://' })} />
                            </FormField>
                        ))}
                    </div>
                </Panel>

                <div className="flex justify-end">{botonGuardar}</div>
            </form>
        </AdminLayout>
    );
}

/** Empresa, contacto y avisos: los ajustes llegan de la API (GET /api/admin/configuracion). */
export default function Empresa() {
    return (
        <PantallaApi url="/admin/configuracion" titulo="Empresa y contacto">
            {({ datos }) => <EmpresaFormulario ajustes={datos} />}
        </PantallaApi>
    );
}
