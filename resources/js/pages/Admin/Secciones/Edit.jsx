import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, Save } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import ItemsRepeater from '@/components/admin/ItemsRepeater';
import PageHeader from '@/components/admin/PageHeader';
import Panel from '@/components/admin/Panel';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Switch from '@/components/ui/Switch';
import Textarea from '@/components/ui/Textarea';
import { PAGINAS } from '@/data/paginas';

export default function SeccionEdit({ seccion }) {
    const usa = (campo) => seccion.campos.includes(campo);
    const esCifras = seccion.clave === 'cifras';
    const esEncabezado = seccion.clave === 'hero';

    const form = useForm({
        subtitulo: seccion.subtitulo ?? '',
        titulo: seccion.titulo ?? '',
        contenido: seccion.contenido ?? '',
        imagen: null,
        quitar_imagen: false,
        boton_texto: seccion.boton_texto ?? '',
        boton_url: seccion.boton_url ?? '',
        items: seccion.items ?? [],
        activo: seccion.activo,
    });
    const { data, setData, errors, processing } = form;

    const guardar = (e) => {
        e.preventDefault();
        form.transform((datos) => ({ ...datos, _method: 'put' }));
        form.post(`/admin/secciones/${seccion.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setData((d) => ({ ...d, imagen: null, quitar_imagen: false })),
        });
    };

    const pagina = PAGINAS[seccion.pagina];
    const [paginaLabel, nombre] = seccion.nombre.includes('·') ? seccion.nombre.split(/\s*·\s*/) : [pagina?.label, seccion.nombre];

    return (
        <AdminLayout title={`Sección: ${nombre}`}>
            <Link href="/admin/secciones" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary">
                <ArrowLeft className="size-4" aria-hidden="true" /> Secciones
            </Link>
            <PageHeader
                title={nombre}
                description={`Página: ${paginaLabel}`}
                actions={
                    <>
                        {pagina?.url && (
                            <Button href={pagina.url} newTab variant="ghost" icon={ExternalLink} className="border border-gray-200">
                                Ver página
                            </Button>
                        )}
                        <Button type="submit" form="form-seccion" variant="secondary" icon={Save} disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </>
                }
            />

            <form id="form-seccion" onSubmit={guardar} className="grid gap-6 lg:grid-cols-3">
                <div className="flex flex-col gap-6 lg:col-span-2">
                    <Panel title="Contenido">
                        <div className="flex flex-col gap-5">
                            {usa('subtitulo') && (
                                <FormField label="Etiqueta superior" htmlFor="subtitulo" error={errors.subtitulo} hint="Texto pequeño en amarillo sobre el título.">
                                    <Input id="subtitulo" value={data.subtitulo} onChange={(e) => setData('subtitulo', e.target.value)} error={errors.subtitulo} />
                                </FormField>
                            )}
                            {usa('titulo') && (
                                <FormField label="Título" htmlFor="titulo" error={errors.titulo}>
                                    <Input id="titulo" value={data.titulo} onChange={(e) => setData('titulo', e.target.value)} error={errors.titulo} />
                                </FormField>
                            )}
                            {usa('contenido') && (
                                <FormField label="Texto" htmlFor="contenido" error={errors.contenido} hint="Deja una línea en blanco para separar párrafos.">
                                    <Textarea id="contenido" rows={6} value={data.contenido} onChange={(e) => setData('contenido', e.target.value)} error={errors.contenido} />
                                </FormField>
                            )}
                        </div>
                    </Panel>

                    {usa('items') && (
                        <Panel
                            title={esCifras ? 'Cifras' : 'Elementos de la lista'}
                            description={esCifras ? 'Ej. valor "+650" y etiqueta "Conductores".' : 'Se muestran como tarjetas en el orden indicado.'}
                        >
                            <ItemsRepeater
                                items={data.items}
                                onChange={(items) => setData('items', items)}
                                errors={errors}
                                conIcono={!esCifras}
                                etiquetas={esCifras ? { titulo: 'Valor', descripcion: 'Etiqueta' } : undefined}
                            />
                        </Panel>
                    )}
                </div>

                <div className="flex flex-col gap-6">
                    <Panel>
                        <Switch
                            label="Mostrar esta sección"
                            description="Si la apagas, no aparece en el sitio."
                            checked={data.activo}
                            onChange={(valor) => setData('activo', valor)}
                        />
                    </Panel>

                    {usa('imagen') && (
                        <Panel title={esEncabezado ? 'Imagen de fondo' : 'Imagen'}>
                            <ImageUpload
                                actualUrl={seccion.imagen_url}
                                archivo={data.imagen}
                                onArchivo={(archivo) => setData('imagen', archivo)}
                                quitada={data.quitar_imagen}
                                onQuitar={(valor) => setData('quitar_imagen', valor)}
                                error={errors.imagen}
                                hint={
                                    esEncabezado
                                        ? 'Foto horizontal detrás del título (se oscurece para leer el texto). Recomendado 1920×700 px. Sin imagen se ve el color de marca.'
                                        : 'Recomendado 1200×900 px. Sin imagen se muestra el logo.'
                                }
                                aspect={esEncabezado ? 'aspect-[16/6]' : 'aspect-[4/3]'}
                            />
                        </Panel>
                    )}

                    {usa('boton') && (
                        <Panel title="Botón">
                            <div className="flex flex-col gap-5">
                                <FormField label="Texto" htmlFor="boton_texto" error={errors.boton_texto}>
                                    <Input id="boton_texto" value={data.boton_texto} onChange={(e) => setData('boton_texto', e.target.value)} error={errors.boton_texto} />
                                </FormField>
                                <FormField label="Enlace" htmlFor="boton_url" error={errors.boton_url} hint="Ej. /contacto o https://... Déjalo vacío para ocultar el botón.">
                                    <Input id="boton_url" value={data.boton_url} onChange={(e) => setData('boton_url', e.target.value)} error={errors.boton_url} />
                                </FormField>
                            </div>
                        </Panel>
                    )}
                </div>
            </form>
        </AdminLayout>
    );
}
