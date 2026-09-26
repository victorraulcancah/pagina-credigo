import { CircleQuestionMark, Plus, Save } from 'lucide-react';
import AccionesFila from '@/components/admin/AccionesFila';
import EmptyState from '@/components/admin/EmptyState';
import EstadoBadge from '@/components/admin/EstadoBadge';
import PageHeader from '@/components/admin/PageHeader';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Switch from '@/components/ui/Switch';
import Textarea from '@/components/ui/Textarea';
import { useCrudModal } from '@/hooks/useCrudModal';

const VACIO = { pregunta: '', respuesta: '', orden: 0, activo: true };

export default function PreguntasIndex({ preguntas }) {
    const crud = useCrudModal({ url: '/admin/preguntas', vacio: VACIO, aFormulario: (p) => ({ ...VACIO, ...p }) });
    const { form } = crud;
    const { data, setData, errors, processing } = form;

    const nueva = (
        <Button variant="secondary" icon={Plus} onClick={() => crud.abrirNuevo({ orden: preguntas.length })}>
            Nueva pregunta
        </Button>
    );

    return (
        <AdminLayout title="Preguntas frecuentes">
            <PageHeader title="Preguntas frecuentes" description="Se muestran en el inicio y en la página de contacto." actions={nueva} />

            {preguntas.length === 0 ? (
                <EmptyState icon={CircleQuestionMark} title="No hay preguntas" description="Agrega las dudas más comunes de tus clientes." action={nueva} />
            ) : (
                <ul className="flex flex-col gap-3">
                    {preguntas.map((item) => (
                        <li key={item.id} className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <EstadoBadge activo={item.activo} />
                                    <span className="text-xs text-gray-400">Orden {item.orden}</span>
                                </div>
                                <h3 className="mt-1 font-bold text-gray-900">{item.pregunta}</h3>
                                <p className="line-clamp-2 text-sm text-gray-500">{item.respuesta}</p>
                            </div>
                            <AccionesFila onEditar={() => crud.abrirEditar(item)} onEliminar={() => crud.eliminar(item, 'esta pregunta')} />
                        </li>
                    ))}
                </ul>
            )}

            <Modal
                open={crud.abierto}
                onClose={crud.cerrar}
                title={crud.editando ? 'Editar pregunta' : 'Nueva pregunta'}
                footer={
                    <>
                        <Button variant="ghost" onClick={crud.cerrar}>Cancelar</Button>
                        <Button type="submit" form="form-pregunta" variant="secondary" icon={Save} disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </>
                }
            >
                <form id="form-pregunta" onSubmit={crud.guardar} className="grid gap-5 sm:grid-cols-2">
                    <FormField label="Pregunta" htmlFor="pregunta" error={errors.pregunta} required className="sm:col-span-2">
                        <Input id="pregunta" value={data.pregunta} onChange={(e) => setData('pregunta', e.target.value)} error={errors.pregunta} />
                    </FormField>
                    <FormField label="Respuesta" htmlFor="respuesta" error={errors.respuesta} required className="sm:col-span-2">
                        <Textarea id="respuesta" rows={5} value={data.respuesta} onChange={(e) => setData('respuesta', e.target.value)} error={errors.respuesta} />
                    </FormField>
                    <FormField label="Orden" htmlFor="orden" error={errors.orden}>
                        <Input id="orden" type="number" min={0} value={data.orden} onChange={(e) => setData('orden', e.target.value)} error={errors.orden} />
                    </FormField>
                    <div className="flex items-center rounded-xl bg-gray-50 px-4 py-3">
                        <Switch className="w-full" label="Visible en el sitio" checked={data.activo} onChange={(valor) => setData('activo', valor)} />
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
