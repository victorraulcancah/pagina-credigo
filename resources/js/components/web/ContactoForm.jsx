import { useForm } from '@inertiajs/react';
import { CircleCheckBig, Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import AceptaPolitica from '@/components/web/AceptaPolitica';
import { registrarLead } from '@/lib/analitica';

const VACIO = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    tipo_consulta: '',
    asunto: '',
    mensaje: '',
    website: '',
    acepta_politica: false,
};

/**
 * Formulario público de contacto, con los mismos campos que el de soporte del ERP.
 * Se guarda en la bandeja del panel (/admin/mensajes).
 */
export default function ContactoForm({ tiposConsulta = {} }) {
    const form = useForm(VACIO);
    const { data, setData, errors, processing, recentlySuccessful } = form;

    const campo = (nombre) => ({
        id: nombre,
        value: data[nombre],
        onChange: (e) => setData(nombre, e.target.value),
        error: errors[nombre],
    });

    const enviar = (e) => {
        e.preventDefault();
        form.post('/contacto', {
            preserveScroll: true,
            onSuccess: () => {
                registrarLead('contacto');
                form.reset();
            },
        });
    };

    return (
        <form onSubmit={enviar} className="grid gap-5 sm:grid-cols-2" noValidate>
            <FormField label="Nombre" htmlFor="nombre" error={errors.nombre} required>
                <Input {...campo('nombre')} autoComplete="given-name" maxLength={100} placeholder="Tu nombre" />
            </FormField>
            <FormField label="Apellido" htmlFor="apellido" error={errors.apellido} required>
                <Input {...campo('apellido')} autoComplete="family-name" maxLength={100} placeholder="Tu apellido" />
            </FormField>
            <FormField label="Correo electrónico" htmlFor="email" error={errors.email} required>
                <Input {...campo('email')} type="email" autoComplete="email" maxLength={150} placeholder="tucorreo@ejemplo.com" />
            </FormField>
            <FormField label="Celular" htmlFor="telefono" error={errors.telefono} required>
                <Input {...campo('telefono')} type="tel" inputMode="tel" autoComplete="tel" placeholder="999 999 999" />
            </FormField>
            <FormField label="Tipo de consulta" htmlFor="tipo_consulta" error={errors.tipo_consulta} required>
                <Select
                    {...campo('tipo_consulta')}
                    placeholder="Selecciona una opción"
                    options={Object.entries(tiposConsulta).map(([value, label]) => ({ value, label }))}
                />
            </FormField>
            <FormField label="Asunto" htmlFor="asunto" error={errors.asunto} required>
                <Input {...campo('asunto')} maxLength={150} placeholder="¿Sobre qué es tu consulta?" />
            </FormField>
            <FormField label="Mensaje" htmlFor="mensaje" error={errors.mensaje} required className="sm:col-span-2">
                <Textarea {...campo('mensaje')} maxLength={2000} placeholder="Cuéntanos en qué podemos ayudarte" />
            </FormField>

            {/* Campo trampa anti-spam: oculto para personas */}
            <div className="hidden" aria-hidden="true">
                <label htmlFor="website">No llenar este campo</label>
                <input
                    id="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={data.website}
                    onChange={(e) => setData('website', e.target.value)}
                />
            </div>

            <AceptaPolitica
                checked={data.acepta_politica}
                onChange={(valor) => setData('acepta_politica', valor)}
                error={errors.acepta_politica}
                className="sm:col-span-2"
            />

            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
                <Button type="submit" variant="secondary" size="lg" icon={Send} disabled={processing}>
                    {processing ? 'Enviando...' : 'Enviar mensaje'}
                </Button>
                {recentlySuccessful && (
                    <p className="flex items-center gap-2 text-sm font-medium text-green-700" role="status">
                        <CircleCheckBig className="size-5" aria-hidden="true" /> Mensaje enviado
                    </p>
                )}
            </div>
        </form>
    );
}
