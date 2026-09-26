import { useForm } from '@inertiajs/react';
import { CircleCheckBig, Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import AceptaPolitica from '@/components/web/AceptaPolitica';

/** Formulario público de contacto → se guarda en la bandeja del panel (/admin/mensajes). */
export default function ContactoForm({ servicios = [] }) {
    const form = useForm({ nombre: '', telefono: '', email: '', asunto: '', mensaje: '', website: '', acepta_politica: false });
    const { data, setData, errors, processing, recentlySuccessful } = form;

    const opcionesAsunto = [...servicios, 'Otro'].map((titulo) => ({ value: titulo, label: titulo }));

    const enviar = (e) => {
        e.preventDefault();
        form.post('/contacto', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <form onSubmit={enviar} className="grid gap-5 sm:grid-cols-2" noValidate>
            <FormField label="Nombre completo" htmlFor="nombre" error={errors.nombre} required>
                <Input
                    id="nombre"
                    autoComplete="name"
                    value={data.nombre}
                    onChange={(e) => setData('nombre', e.target.value)}
                    error={errors.nombre}
                    placeholder="Tu nombre"
                />
            </FormField>
            <FormField label="Celular" htmlFor="telefono" error={errors.telefono} required>
                <Input
                    id="telefono"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={data.telefono}
                    onChange={(e) => setData('telefono', e.target.value)}
                    error={errors.telefono}
                    placeholder="999 999 999"
                />
            </FormField>
            <FormField label="Correo" htmlFor="email" error={errors.email}>
                <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    placeholder="tucorreo@ejemplo.com"
                />
            </FormField>
            <FormField label="¿Qué te interesa?" htmlFor="asunto" error={errors.asunto}>
                <Select
                    id="asunto"
                    value={data.asunto}
                    onChange={(e) => setData('asunto', e.target.value)}
                    error={errors.asunto}
                    placeholder="Elige una opción"
                    options={opcionesAsunto}
                />
            </FormField>
            <FormField label="Mensaje" htmlFor="mensaje" error={errors.mensaje} required className="sm:col-span-2">
                <Textarea
                    id="mensaje"
                    value={data.mensaje}
                    onChange={(e) => setData('mensaje', e.target.value)}
                    error={errors.mensaje}
                    placeholder="Cuéntanos qué necesitas"
                />
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
