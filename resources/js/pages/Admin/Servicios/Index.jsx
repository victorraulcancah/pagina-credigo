import { Briefcase, Plus, Save, Star } from 'lucide-react';
import AccionesFila from '@/components/admin/AccionesFila';
import EmptyState from '@/components/admin/EmptyState';
import EstadoBadge from '@/components/admin/EstadoBadge';
import IconPicker from '@/components/admin/IconPicker';
import ImageUpload from '@/components/admin/ImageUpload';
import PageHeader from '@/components/admin/PageHeader';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Icono from '@/components/ui/Icono';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Switch from '@/components/ui/Switch';
import Textarea from '@/components/ui/Textarea';
import { useCrudModal } from '@/hooks/useCrudModal';

const VACIO = { titulo: '', descripcion: '', icono: 'Sparkles', imagen: null, quitar_imagen: false, destacado: false, orden: 0, activo: true };

export default function ServiciosIndex({ servicios }) {
    const crud = useCrudModal({
        url: '/admin/servicios',
        vacio: VACIO,
        aFormulario: (s) => ({ ...VACIO, ...s, icono: s.icono ?? 'Sparkles', imagen: null }),
    });
    const { form } = crud;
    const { data, setData, errors, processing } = form;

    const nuevo = (
        <Button variant="secondary" icon={Plus} onClick={() => crud.abrirNuevo({ orden: servicios.length })}>
            Nuevo servicio
        </Button>
    );

    return (
        <AdminLayout title="Servicios">
            <PageHeader
                title="Servicios"
                description="Se listan en la página Servicios. Los destacados también aparecen en el inicio."
                actions={nuevo}
            />

            {servicios.length === 0 ? (
                <EmptyState icon={Briefcase} title="No hay servicios" description="Agrega los servicios o productos que ofrece la empresa." action={nuevo} />
            ) : (
                <ul className="grid gap-3 md:grid-cols-2">
                    {servicios.map((servicio) => (
                        <li key={servicio.id} className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                                <Icono nombre={servicio.icono} className="size-6" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <EstadoBadge activo={servicio.activo} />
                                    {servicio.destacado && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-semibold text-accent-800">
                                            <Star className="size-3" aria-hidden="true" /> En inicio
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-400">Orden {servicio.orden}</span>
                                </div>
                                <h3 className="mt-1 font-bold text-gray-900">{servicio.titulo}</h3>
                                <p className="line-clamp-2 text-sm text-gray-500">{servicio.descripcion}</p>
                            </div>
                            <AccionesFila onEditar={() => crud.abrirEditar(servicio)} onEliminar={() => crud.eliminar(servicio, `"${servicio.titulo}"`)} />
                        </li>
                    ))}
                </ul>
            )}

            <Modal
                open={crud.abierto}
                onClose={crud.cerrar}
                title={crud.editando ? 'Editar servicio' : 'Nuevo servicio'}
                footer={
                    <>
                        <Button variant="ghost" onClick={crud.cerrar}>Cancelar</Button>
                        <Button type="submit" form="form-servicio" variant="secondary" icon={Save} disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </>
                }
            >
                <form id="form-servicio" onSubmit={crud.guardar} className="grid gap-5 sm:grid-cols-2">
                    <FormField label="Nombre del servicio" htmlFor="titulo" error={errors.titulo} required>
                        <Input id="titulo" value={data.titulo} onChange={(e) => setData('titulo', e.target.value)} error={errors.titulo} />
                    </FormField>
                    <FormField label="Ícono" htmlFor="icono" error={errors.icono}>
                        <IconPicker id="icono" value={data.icono} onChange={(icono) => setData('icono', icono)} />
                    </FormField>
                    <FormField label="Descripción" htmlFor="descripcion" error={errors.descripcion} required className="sm:col-span-2">
                        <Textarea id="descripcion" rows={4} value={data.descripcion} onChange={(e) => setData('descripcion', e.target.value)} error={errors.descripcion} />
                    </FormField>
                    <div className="sm:col-span-2">
                        <ImageUpload
                            label="Imagen (opcional)"
                            actualUrl={crud.editando?.imagen_url}
                            archivo={data.imagen}
                            onArchivo={(archivo) => setData('imagen', archivo)}
                            quitada={data.quitar_imagen}
                            onQuitar={(valor) => setData('quitar_imagen', valor)}
                            error={errors.imagen}
                            hint="Se muestra arriba de la tarjeta. Recomendado 1280×720 px. JPG, PNG o WEBP, máx. 4 MB."
                        />
                    </div>
                    <FormField label="Orden" htmlFor="orden" error={errors.orden} hint="Menor número = aparece primero.">
                        <Input id="orden" type="number" min={0} value={data.orden} onChange={(e) => setData('orden', e.target.value)} error={errors.orden} />
                    </FormField>
                    <div className="flex flex-col justify-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                        <Switch label="Visible en el sitio" checked={data.activo} onChange={(valor) => setData('activo', valor)} />
                        <Switch label="Mostrar en el inicio" checked={data.destacado} onChange={(valor) => setData('destacado', valor)} />
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
