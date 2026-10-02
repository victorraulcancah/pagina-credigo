import { CircleCheckBig, Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import AceptaPolitica from '@/components/web/AceptaPolitica';
import { useFormApi } from '@/hooks/useFormApi';
import { registrarLead } from '@/lib/analitica';

/**
 * Pedido de información de una cotización. Se envía a la API (POST /api/solicitudes) como solicitud
 * del cotizador, con el plan y los montos elegidos en el asunto y el mensaje.
 */
export default function CotizacionForm({ asunto, detalle }) {
    const form = useFormApi({ nombre: '', telefono: '', email: '', comentario: '', website: '', acepta_politica: false });
    const { data, setData, errors, processing, recentlySuccessful } = form;

    const enviar = (e) => {
        e.preventDefault();
        const { comentario, ...resto } = data;
        form.post('/solicitudes', {
            recargar: false,
            datos: { ...resto, asunto, origen: 'cotizador', mensaje: comentario ? `${detalle}\n\nComentario: ${comentario}` : detalle },
            onSuccess: () => {
                registrarLead('cotizador');
                form.reset();
            },
        });
    };

    return (
        <form onSubmit={enviar} className="grid gap-5 sm:grid-cols-2" noValidate>
            <FormField label="Nombre completo" htmlFor="cot-nombre" error={errors.nombre} required>
                <Input id="cot-nombre" autoComplete="name" value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} error={errors.nombre} />
            </FormField>
            <FormField label="Celular" htmlFor="cot-telefono" error={errors.telefono} required>
                <Input
                    id="cot-telefono"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={data.telefono}
                    onChange={(e) => setData('telefono', e.target.value)}
                    error={errors.telefono}
                    placeholder="999 999 999"
                />
            </FormField>
            <FormField label="Correo" htmlFor="cot-email" error={errors.email} hint="Opcional" className="sm:col-span-2">
                <Input id="cot-email" type="email" autoComplete="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} />
            </FormField>
            <FormField label="Comentario" htmlFor="cot-comentario" error={errors.mensaje} hint="Opcional. Ej. ¿en qué plataforma trabajas?" className="sm:col-span-2">
                <Textarea id="cot-comentario" rows={3} value={data.comentario} onChange={(e) => setData('comentario', e.target.value)} />
            </FormField>

            <div className="hidden" aria-hidden="true">
                <input tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => setData('website', e.target.value)} />
            </div>

            <AceptaPolitica
                checked={data.acepta_politica}
                onChange={(valor) => setData('acepta_politica', valor)}
                error={errors.acepta_politica}
                className="sm:col-span-2"
            />

            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
                <Button type="submit" variant="secondary" size="lg" icon={Send} disabled={processing}>
                    {processing ? 'Enviando...' : 'Quiero este plan'}
                </Button>
                {recentlySuccessful && (
                    <p className="flex items-center gap-2 text-sm font-medium text-green-700" role="status">
                        <CircleCheckBig className="size-5" aria-hidden="true" /> Solicitud enviada, te contactaremos pronto
                    </p>
                )}
            </div>
        </form>
    );
}
