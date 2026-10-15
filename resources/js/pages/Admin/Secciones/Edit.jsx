import { Link } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, RotateCcw, Save } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import ColorInput from '@/components/admin/ColorInput';
import ImageUpload from '@/components/admin/ImageUpload';
import ItemsRepeater from '@/components/admin/ItemsRepeater';
import PageHeader from '@/components/admin/PageHeader';
import PantallaApi from '@/components/admin/PantallaApi';
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
import { cn, SOMBRA_TEXTO } from '@/lib/utils';

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

const COLORES = [
    ['color_titulo', 'Color del título'],
    ['color_texto', 'Color del texto'],
];

/**
 * Colores del título y del texto de un encabezado, con la vista previa sobre su fondo
 * (la imagen elegida o el azul de marca). Vacío = blanco, como en el sitio.
 */
function ColoresEncabezado({ data, setData, errors, imagenUrl }) {
    const imagenNueva = useMemo(() => (data.imagen ? URL.createObjectURL(data.imagen) : null), [data.imagen]);
    useEffect(() => () => imagenNueva && URL.revokeObjectURL(imagenNueva), [imagenNueva]);
    const fondo = imagenNueva ?? (data.quitar_imagen ? null : imagenUrl);

    return (
        <Panel title="Colores del texto" description="Por defecto el título y el texto van en blanco. Cámbialos si no se leen bien sobre la imagen de fondo.">
            <div className="flex flex-col gap-5">
                <div className="relative overflow-hidden rounded-xl bg-primary px-4 py-6" aria-label="Vista previa del encabezado">
                    {fondo && <img src={fondo} alt="" className="absolute inset-0 size-full object-cover" />}
                    <div className="relative">
                        <p className={cn('text-xl leading-tight font-bold text-white', fondo && SOMBRA_TEXTO)} style={data.color_titulo ? { color: data.color_titulo } : undefined}>
                            {data.titulo || 'Título'}
                        </p>
                        <p
                            className={cn('mt-1.5 line-clamp-2 text-sm text-white/80', fondo && SOMBRA_TEXTO)}
                            style={data.color_texto ? { color: data.color_texto } : undefined}
                        >
                            {data.contenido || 'Texto del encabezado'}
                        </p>
                    </div>
                </div>

                {COLORES.map(([campo, etiqueta]) => (
                    <FormField key={campo} label={etiqueta} htmlFor={campo} error={errors[campo]}>
                        <ColorInput
                            id={campo}
                            value={data[campo]}
                            onChange={(valor) => setData(campo, valor)}
                            error={errors[campo]}
                            porDefecto="#ffffff"
                            placeholder="Blanco (por defecto)"
                        />
                    </FormField>
                ))}

                {(data.color_titulo || data.color_texto) && (
                    <button
                        type="button"
                        onClick={() => setData((d) => ({ ...d, color_titulo: '', color_texto: '' }))}
                        className="inline-flex items-center gap-2 self-start text-sm font-medium text-gray-600 hover:text-primary"
                    >
                        <RotateCcw className="size-4" aria-hidden="true" /> Volver al blanco
                    </button>
                )}
            </div>
        </Panel>
    );
}

function SeccionFormulario({ seccion }) {
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
        color_titulo: seccion.color_titulo ?? '',
        color_texto: seccion.color_texto ?? '',
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

                    {usa('colores') && <ColoresEncabezado data={data} setData={setData} errors={errors} imagenUrl={seccion.imagen_url} />}

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

/** Edición de una sección: la pide a la API (GET /api/admin/secciones/{id}). */
export default function SeccionEdit({ seccionId }) {
    return (
        <PantallaApi url={`/admin/secciones/${seccionId}`} titulo="Sección">
            {({ datos }) => <SeccionFormulario seccion={datos} />}
        </PantallaApi>
    );
}
