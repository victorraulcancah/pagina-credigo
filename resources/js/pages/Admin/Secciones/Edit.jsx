import { Link } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, Save } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import ItemsRepeater from '@/components/admin/ItemsRepeater';
import PageHeader from '@/components/admin/PageHeader';
import VideoInput from '@/components/admin/VideoInput';
import Panel from '@/components/admin/Panel';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Switch from '@/components/ui/Switch';
import Textarea from '@/components/ui/Textarea';
import { useFormApi } from '@/hooks/useFormApi';
import { PAGINAS } from '@/data/paginas';

const URLS_LEGALES = { terminos: '/terminos-y-condiciones', privacidad: '/politica-de-privacidad' };

// Cómo se edita la lista (items) de cada tipo de sección
const LISTA_GENERAL = { titulo: 'Elementos de la lista', descripcion: 'Se muestran como tarjetas en el orden indicado.', conIcono: true };
const LISTAS = {
    cifras: {
        titulo: 'Cifras',
        descripcion: 'Ej. valor "650+" y etiqueta "conductores financiados". Se muestran al pie del banner del inicio y en Nosotros.',
        conIcono: false,
        etiquetas: { titulo: 'Valor', descripcion: 'Etiqueta' },
    },
    pasos_rapidos: {
        titulo: 'Pasos',
        descripcion: 'Franja amarilla debajo del banner del inicio. Se numeran solos.',
        conIcono: false,
        etiquetas: { titulo: 'Paso', descripcion: 'Detalle' },
    },
    cuentas: {
        titulo: 'Cuentas oficiales',
        descripcion:
            'Una tarjeta por cuenta. En "Datos" escribe una línea por número, por ejemplo "Cuenta: 193-1234567-0-12" y "CCI: 002-193-001234567012-15". En la web cada número se copia con un toque. Sin cuentas, el bloque no se muestra.',
        conIcono: true,
        etiquetas: { titulo: 'Banco y tipo de cuenta', descripcion: 'Datos (una línea por número)' },
    },
    beneficios: {
        titulo: 'Niveles',
        descripcion: 'En orden: el 1.º se pinta bronce, el 2.º plata y el 3.º oro (este último resaltado).',
        conIcono: true,
    },
};

export default function SeccionEdit({ seccion }) {
    const usa = (campo) => seccion.campos.includes(campo);
    const esEncabezado = seccion.clave === 'hero';
    // Misión, visión y objetivo: la imagen va al costado del texto en Nosotros
    const esPilar = seccion.pagina === 'nosotros' && ['mision', 'vision', 'objetivo'].includes(seccion.clave);
    const lista = LISTAS[seccion.clave] ?? LISTA_GENERAL;
    const tieneTextos = ['subtitulo', 'titulo', 'contenido'].some(usa);
    // En las secciones de texto con imagen, el video reemplaza a la imagen
    const esTextoConImagen = usa('imagen') && usa('video');

    const form = useFormApi({
        subtitulo: seccion.subtitulo ?? '',
        titulo: seccion.titulo ?? '',
        contenido: seccion.contenido ?? '',
        imagen: null,
        quitar_imagen: false,
        boton_texto: seccion.boton_texto ?? '',
        boton_url: seccion.boton_url ?? '',
        video_url: seccion.video_url ?? '',
        items: seccion.items ?? [],
        activo: seccion.activo,
    });
    const { data, setData, errors, processing } = form;

    const guardar = (e) => {
        e.preventDefault();
        form.put(`/admin/secciones/${seccion.id}`, {
            onSuccess: () => setData((d) => ({ ...d, imagen: null, quitar_imagen: false })),
        });
    };

    const pagina = PAGINAS[seccion.pagina];
    const [paginaLabel, nombre] = seccion.nombre.includes('·') ? seccion.nombre.split(/\s*·\s*/) : [pagina?.label, seccion.nombre];
    const esLegal = seccion.pagina === 'legal';
    const urlPagina = esLegal ? URLS_LEGALES[seccion.clave] : pagina?.url;

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
                        {urlPagina && (
                            <Button href={urlPagina} newTab variant="ghost" icon={ExternalLink} className="border border-gray-200">
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
                    {tieneTextos && (
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
                                <FormField
                                    label="Texto"
                                    htmlFor="contenido"
                                    error={errors.contenido}
                                    hint={
                                        esLegal
                                            ? 'Formato: "## " al inicio de una línea = subtítulo · "- " = viñeta · línea en blanco = nuevo párrafo.'
                                            : 'Deja una línea en blanco para separar párrafos.'
                                    }
                                >
                                    <Textarea
                                        id="contenido"
                                        rows={esLegal ? 22 : 6}
                                        value={data.contenido}
                                        onChange={(e) => setData('contenido', e.target.value)}
                                        error={errors.contenido}
                                        className={esLegal ? 'font-mono text-sm' : undefined}
                                    />
                                </FormField>
                            )}
                        </div>
                    </Panel>
                    )}

                    {usa('items') && (
                        <Panel title={lista.titulo} description={lista.descripcion}>
                            <ItemsRepeater
                                items={data.items}
                                onChange={(items) => setData('items', items)}
                                errors={errors}
                                conIcono={lista.conIcono}
                                etiquetas={lista.etiquetas}
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
                                        ? 'Se muestra tal cual detrás del título. Deja libre el lado izquierdo para el texto. Recomendado 1920×700 px. Sin imagen se ve el color de marca.'
                                        : esPilar
                                          ? 'Va al costado del texto (los lados se alternan). Recomendado 1600×900 px. Sin imagen se muestra un recuadro con el ícono.'
                                          : 'Recomendado 1200×900 px. Sin imagen se muestra el logo.'
                                }
                                aspect={esEncabezado ? 'aspect-[16/6]' : esPilar ? 'aspect-video' : 'aspect-[4/3]'}
                            />
                        </Panel>
                    )}

                    {usa('video') && (
                        <Panel title="Video" description={esTextoConImagen ? 'Si pones un video, se muestra en lugar de la imagen.' : 'Se muestra debajo del título de la sección.'}>
                            <VideoInput value={data.video_url} onChange={(valor) => setData('video_url', valor)} error={errors.video_url} />
                        </Panel>
                    )}

                    {usa('boton') && (
                        <Panel title="Botón">
                            <div className="flex flex-col gap-5">
                                <FormField label="Texto" htmlFor="boton_texto" error={errors.boton_texto}>
                                    <Input id="boton_texto" value={data.boton_texto} onChange={(e) => setData('boton_texto', e.target.value)} error={errors.boton_texto} />
                                </FormField>
                                <FormField label="Enlace" htmlFor="boton_url" error={errors.boton_url} hint="Ej. /soporte o https://... Déjalo vacío para ocultar el botón.">
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
