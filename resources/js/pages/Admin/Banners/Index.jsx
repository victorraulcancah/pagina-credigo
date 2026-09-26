import { ImageOff, Images, Plus, Save } from 'lucide-react';
import AccionesFila from '@/components/admin/AccionesFila';
import EmptyState from '@/components/admin/EmptyState';
import EstadoBadge from '@/components/admin/EstadoBadge';
import ImageUpload from '@/components/admin/ImageUpload';
import PageHeader from '@/components/admin/PageHeader';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Switch from '@/components/ui/Switch';
import Textarea from '@/components/ui/Textarea';
import { useCrudModal } from '@/hooks/useCrudModal';

const VACIO = { titulo: '', subtitulo: '', imagen: null, quitar_imagen: false, boton_texto: '', boton_url: '', orden: 0, activo: true };

export default function BannersIndex({ banners }) {
    const crud = useCrudModal({
        url: '/admin/banners',
        vacio: VACIO,
        aFormulario: (b) => ({ ...VACIO, ...b, subtitulo: b.subtitulo ?? '', boton_texto: b.boton_texto ?? '', boton_url: b.boton_url ?? '', imagen: null }),
    });
    const { form } = crud;
    const { data, setData, errors, processing } = form;

    const nuevo = (
        <Button variant="secondary" icon={Plus} onClick={() => crud.abrirNuevo({ orden: banners.length })}>
            Nuevo banner
        </Button>
    );

    return (
        <AdminLayout title="Banners">
            <PageHeader title="Banners" description="Carrusel del inicio: cada banner con su imagen de fondo. Se muestran en el orden indicado y cambian cada 6 segundos." actions={nuevo} />

            {banners.length === 0 ? (
                <EmptyState icon={Images} title="No hay banners" description="Sin banners, el inicio muestra el nombre y la descripción de la empresa." action={nuevo} />
            ) : (
                <ul className="flex flex-col gap-3">
                    {banners.map((banner) => (
                        <li key={banner.id} className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:flex-row sm:items-center">
                            <div className="flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary sm:w-44">
                                {banner.imagen_url ? (
                                    <img src={banner.imagen_url} alt="" className="size-full object-cover" />
                                ) : (
                                    <ImageOff className="size-6 text-white/40" aria-label="Sin imagen" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <EstadoBadge activo={banner.activo} />
                                    <span className="text-xs text-gray-400">Orden {banner.orden}</span>
                                </div>
                                <h3 className="mt-1 font-bold text-gray-900">{banner.titulo}</h3>
                                {banner.subtitulo && <p className="line-clamp-2 text-sm text-gray-500">{banner.subtitulo}</p>}
                                {banner.boton_texto && (
                                    <p className="mt-1 text-xs text-gray-400">
                                        Botón: <span className="font-medium text-gray-600">{banner.boton_texto}</span> → {banner.boton_url}
                                    </p>
                                )}
                            </div>
                            <AccionesFila onEditar={() => crud.abrirEditar(banner)} onEliminar={() => crud.eliminar(banner, 'este banner')} />
                        </li>
                    ))}
                </ul>
            )}

            <Modal
                open={crud.abierto}
                onClose={crud.cerrar}
                title={crud.editando ? 'Editar banner' : 'Nuevo banner'}
                footer={
                    <>
                        <Button variant="ghost" onClick={crud.cerrar}>Cancelar</Button>
                        <Button type="submit" form="form-banner" variant="secondary" icon={Save} disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </>
                }
            >
                <form id="form-banner" onSubmit={crud.guardar} className="grid gap-5 sm:grid-cols-2">
                    <FormField label="Título" htmlFor="titulo" error={errors.titulo} required className="sm:col-span-2">
                        <Input id="titulo" value={data.titulo} onChange={(e) => setData('titulo', e.target.value)} error={errors.titulo} />
                    </FormField>
                    <FormField label="Subtítulo" htmlFor="subtitulo" error={errors.subtitulo} className="sm:col-span-2">
                        <Textarea id="subtitulo" rows={2} value={data.subtitulo} onChange={(e) => setData('subtitulo', e.target.value)} error={errors.subtitulo} />
                    </FormField>
                    <div className="sm:col-span-2">
                        <ImageUpload
                            label="Imagen de fondo"
                            actualUrl={crud.editando?.imagen_url}
                            archivo={data.imagen}
                            onArchivo={(archivo) => setData('imagen', archivo)}
                            quitada={data.quitar_imagen}
                            onQuitar={(valor) => setData('quitar_imagen', valor)}
                            error={errors.imagen}
                            hint="Foto horizontal a pantalla completa (el texto va a la izquierda, sobre una capa oscura). Recomendado 1920×1080 px. JPG o WEBP, máx. 4 MB."
                        />
                    </div>
                    <FormField label="Texto del botón" htmlFor="boton_texto" error={errors.boton_texto}>
                        <Input id="boton_texto" value={data.boton_texto} onChange={(e) => setData('boton_texto', e.target.value)} error={errors.boton_texto} placeholder="Solicitar información" />
                    </FormField>
                    <FormField label="Enlace del botón" htmlFor="boton_url" error={errors.boton_url} hint="Ej. /contacto o https://...">
                        <Input id="boton_url" value={data.boton_url} onChange={(e) => setData('boton_url', e.target.value)} error={errors.boton_url} placeholder="/contacto" />
                    </FormField>
                    <FormField label="Orden" htmlFor="orden" error={errors.orden} hint="Menor número = aparece primero.">
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
