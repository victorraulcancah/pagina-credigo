import { ImageOff, Images, Plus, Save, Smartphone } from 'lucide-react';
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

const VACIO = {
    etiqueta: '',
    titulo: '',
    subtitulo: '',
    imagen: null,
    quitar_imagen: false,
    solo_imagen: false,
    imagen_movil: null,
    quitar_imagen_movil: false,
    boton_texto: '',
    boton_url: '',
    boton2_texto: '',
    boton2_url: '',
    orden: 0,
    activo: true,
};

// Los campos de texto vacíos llegan como null desde la BD; el formulario usa ''
const sinNulos = (banner) => Object.fromEntries(Object.entries(banner).map(([clave, valor]) => [clave, valor ?? '']));

export default function BannersIndex({ banners }) {
    const crud = useCrudModal({
        url: '/admin/banners',
        vacio: VACIO,
        aFormulario: (b) => ({
            ...VACIO,
            ...sinNulos(b),
            solo_imagen: b.solo_imagen,
            imagen: null,
            quitar_imagen: false,
            imagen_movil: null,
            quitar_imagen_movil: false,
        }),
    });
    const { form } = crud;
    const { data, setData, errors, processing } = form;
    const soloImagen = data.solo_imagen;

    const nuevo = (
        <Button variant="secondary" icon={Plus} onClick={() => crud.abrirNuevo({ orden: banners.length })}>
            Nuevo banner
        </Button>
    );

    return (
        <AdminLayout title="Banners">
            <PageHeader
                title="Banners"
                description="Carrusel del inicio: cada banner con su imagen de fondo. Se muestran en el orden indicado y cambian cada 6 segundos."
                actions={nuevo}
            />

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
                                    {banner.solo_imagen && (
                                        <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary">Solo imagen</span>
                                    )}
                                    {banner.imagen_movil_url && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                                            <Smartphone className="size-3" aria-hidden="true" /> Imagen para celular
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-400">Orden {banner.orden}</span>
                                </div>
                                <h3 className="mt-1 font-bold text-gray-900">{banner.titulo}</h3>
                                {!banner.solo_imagen && banner.subtitulo && <p className="line-clamp-2 text-sm text-gray-500">{banner.subtitulo}</p>}
                                {banner.boton_url && (
                                    <p className="mt-1 text-xs text-gray-400">
                                        {banner.solo_imagen ? 'Al hacer clic' : `Botón: ${banner.boton_texto}`} → {banner.boton_url}
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
                        <Button variant="ghost" onClick={crud.cerrar}>
                            Cancelar
                        </Button>
                        <Button type="submit" form="form-banner" variant="secondary" icon={Save} disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </>
                }
            >
                <form id="form-banner" onSubmit={crud.guardar} className="grid gap-5 sm:grid-cols-2">
                    <div className="rounded-xl bg-gray-50 px-4 py-3 sm:col-span-2">
                        <Switch
                            label="Solo imagen"
                            description="Para diseños que ya traen sus textos (ej. hechos en Canva): se muestran tal cual, sin título ni botones encima."
                            checked={soloImagen}
                            onChange={(valor) => setData('solo_imagen', valor)}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <ImageUpload
                            label={soloImagen ? 'Diseño (computadora)' : 'Imagen de fondo'}
                            actualUrl={crud.editando?.imagen_url}
                            archivo={data.imagen}
                            onArchivo={(archivo) => setData('imagen', archivo)}
                            quitada={data.quitar_imagen}
                            onQuitar={(valor) => setData('quitar_imagen', valor)}
                            error={errors.imagen}
                            hint={
                                soloImagen
                                    ? 'Horizontal, 1920×1080 px. JPG o WEBP, máx. 4 MB.'
                                    : 'Se muestra tal cual, a pantalla completa. Deja libre el lado izquierdo para el texto. Recomendado 1920×1080 px. JPG o WEBP, máx. 4 MB.'
                            }
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <div className="max-w-56">
                            <ImageUpload
                                label="Imagen para celular (opcional)"
                                actualUrl={crud.editando?.imagen_movil_url}
                                archivo={data.imagen_movil}
                                onArchivo={(archivo) => setData('imagen_movil', archivo)}
                                quitada={data.quitar_imagen_movil}
                                onQuitar={(valor) => setData('quitar_imagen_movil', valor)}
                                error={errors.imagen_movil}
                                aspect="aspect-[2/3]"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Versión vertical para pantallas pequeñas, 1080×1620 px. Si no la subes, en celular se usa la imagen de computadora
                            {soloImagen ? ' completa (con franjas arriba y abajo).' : ' recortada.'}
                        </p>
                    </div>

                    {!soloImagen && (
                        <FormField
                            label="Etiqueta"
                            htmlFor="etiqueta"
                            error={errors.etiqueta}
                            hint="Píldora amarilla sobre el título. Si la dejas vacía se usa el eslogan de la empresa."
                            className="sm:col-span-2"
                        >
                            <Input id="etiqueta" value={data.etiqueta} onChange={(e) => setData('etiqueta', e.target.value)} error={errors.etiqueta} placeholder="Anda con el tuyo — Arequipa y Lima" />
                        </FormField>
                    )}

                    <FormField
                        label={soloImagen ? 'Nombre del banner' : 'Título'}
                        htmlFor="titulo"
                        error={errors.titulo}
                        required
                        hint={soloImagen ? 'No se muestra; lo usan Google y los lectores de pantalla.' : undefined}
                        className="sm:col-span-2"
                    >
                        <Input id="titulo" value={data.titulo} onChange={(e) => setData('titulo', e.target.value)} error={errors.titulo} />
                    </FormField>

                    {!soloImagen && (
                        <FormField label="Subtítulo" htmlFor="subtitulo" error={errors.subtitulo} className="sm:col-span-2">
                            <Textarea id="subtitulo" rows={2} value={data.subtitulo} onChange={(e) => setData('subtitulo', e.target.value)} error={errors.subtitulo} />
                        </FormField>
                    )}

                    {soloImagen ? (
                        <FormField
                            label="Enlace al hacer clic (opcional)"
                            htmlFor="boton_url"
                            error={errors.boton_url}
                            hint="Toda la imagen lleva a esta página. Ej. /soporte o /#como-funciona"
                            className="sm:col-span-2"
                        >
                            <Input id="boton_url" value={data.boton_url} onChange={(e) => setData('boton_url', e.target.value)} error={errors.boton_url} placeholder="/soporte" />
                        </FormField>
                    ) : (
                        <>
                            <FormField label="Botón principal (amarillo)" htmlFor="boton_texto" error={errors.boton_texto}>
                                <Input id="boton_texto" value={data.boton_texto} onChange={(e) => setData('boton_texto', e.target.value)} error={errors.boton_texto} placeholder="Empieza tu ahorro" />
                            </FormField>
                            <FormField label="Enlace del botón principal" htmlFor="boton_url" error={errors.boton_url} hint="Ej. /soporte o https://...">
                                <Input id="boton_url" value={data.boton_url} onChange={(e) => setData('boton_url', e.target.value)} error={errors.boton_url} placeholder="/soporte" />
                            </FormField>
                            <FormField label="Segundo botón (borde blanco)" htmlFor="boton2_texto" error={errors.boton2_texto} hint="Vacío = se muestra el botón de WhatsApp.">
                                <Input id="boton2_texto" value={data.boton2_texto} onChange={(e) => setData('boton2_texto', e.target.value)} error={errors.boton2_texto} placeholder="Ver cómo funciona" />
                            </FormField>
                            <FormField label="Enlace del segundo botón" htmlFor="boton2_url" error={errors.boton2_url} hint="Ej. /#como-funciona (baja a esa sección del inicio)">
                                <Input id="boton2_url" value={data.boton2_url} onChange={(e) => setData('boton2_url', e.target.value)} error={errors.boton2_url} placeholder="/#como-funciona" />
                            </FormField>
                        </>
                    )}

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
