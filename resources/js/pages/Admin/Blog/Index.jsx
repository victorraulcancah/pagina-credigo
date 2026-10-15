import { Check, ExternalLink, Eye, Heading2, ImagePlus, List, Newspaper, Pencil, Plus, Save, Star, Tags, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import AccionesFila from '@/components/admin/AccionesFila';
import Cargando from '@/components/admin/Cargando';
import EmptyState from '@/components/admin/EmptyState';
import ImageUpload from '@/components/admin/ImageUpload';
import PageHeader from '@/components/admin/PageHeader';
import Panel from '@/components/admin/Panel';
import VideoInput from '@/components/admin/VideoInput';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Switch from '@/components/ui/Switch';
import Textarea from '@/components/ui/Textarea';
import { fechaArticulo } from '@/components/web/Blog';
import { useAccionApi } from '@/hooks/useAccionApi';
import { useConsulta } from '@/hooks/useConsulta';
import { useCrudModal } from '@/hooks/useCrudModal';
import api, { erroresDeValidacion, mensajeDeError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { deleteConfirm, errorAlert } from '@/utils/sweetalert';

const MAX_RESUMEN = 300;

const VACIO = {
    titulo: '',
    slug: '',
    categoria_blog_id: '',
    resumen: '',
    contenido: '',
    portada: null,
    quitar_portada: false,
    video_url: '',
    autor: '',
    publicado: false,
    destacado: false,
    publicado_at: '',
};

const ESTADOS = {
    publicado: { texto: 'Publicado', clases: 'bg-green-100 text-green-700' },
    programado: { texto: 'Programado', clases: 'bg-blue-100 text-blue-700' },
    borrador: { texto: 'Borrador', clases: 'bg-gray-100 text-gray-600' },
};

// La fecha viaja como ISO (UTC); el campo datetime-local trabaja con la hora local del navegador
const aHoraLocal = (iso) => {
    if (!iso) return '';
    const fecha = new Date(iso);
    return new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const aIso = (local) => (local ? new Date(local).toISOString() : '');

/**
 * Contenido del artículo con botones para dar formato: subtítulo, viñeta e imagen.
 * "Imagen" sube el archivo y escribe "![pie de foto](dirección)" donde está el cursor.
 */
function EditorContenido({ value, onChange, error }) {
    const area = useRef(null);
    const archivo = useRef(null);
    const [subiendo, setSubiendo] = useState(false);

    /** Inserta `texto` donde está el cursor (en su propia línea si `bloque`). */
    const insertar = (texto, bloque = true) => {
        const el = area.current;
        const inicio = el?.selectionStart ?? value.length;
        const fin = el?.selectionEnd ?? value.length;
        const antes = value.slice(0, inicio);
        const despues = value.slice(fin);
        const prefijo = bloque && antes && !antes.endsWith('\n\n') ? (antes.endsWith('\n') ? '\n' : '\n\n') : '';
        const sufijo = bloque && despues && !despues.startsWith('\n\n') ? '\n\n' : '';
        const nuevo = `${antes}${prefijo}${texto}${sufijo}${despues}`;
        onChange(nuevo);

        const cursor = (antes + prefijo + texto).length;
        requestAnimationFrame(() => {
            el?.focus();
            el?.setSelectionRange(cursor, cursor);
        });
    };

    const subirImagen = async (e) => {
        const imagen = e.target.files?.[0];
        e.target.value = '';
        if (!imagen) return;

        setSubiendo(true);
        try {
            const datos = new FormData();
            datos.append('imagen', imagen);
            const respuesta = await api.post('/admin/articulos/imagenes', datos);
            insertar(`![Pie de foto (opcional)](${respuesta.data.data.url})`);
        } catch (err) {
            errorAlert('No se pudo subir la imagen', Object.values(erroresDeValidacion(err))[0] ?? mensajeDeError(err));
        } finally {
            setSubiendo(false);
        }
    };

    const boton = 'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-white hover:text-primary disabled:opacity-50';

    return (
        <div className={cn('overflow-hidden rounded-xl border bg-white', error ? 'border-red-500' : 'border-primary-200 focus-within:border-primary')}>
            <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-1.5">
                <button type="button" className={boton} onClick={() => insertar('## Subtítulo')}>
                    <Heading2 className="size-4" aria-hidden="true" /> Subtítulo
                </button>
                <button type="button" className={boton} onClick={() => insertar('- Primer punto\n- Segundo punto')}>
                    <List className="size-4" aria-hidden="true" /> Lista
                </button>
                <button type="button" className={boton} onClick={() => archivo.current?.click()} disabled={subiendo}>
                    <ImagePlus className="size-4" aria-hidden="true" /> {subiendo ? 'Subiendo...' : 'Imagen'}
                </button>
                <input ref={archivo} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={subirImagen} />
            </div>
            <textarea
                id="contenido"
                ref={area}
                rows={16}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-invalid={error ? true : undefined}
                placeholder="Escribe el artículo. Deja una línea en blanco entre párrafos."
                className="block w-full resize-y px-4 py-3 text-sm leading-relaxed text-primary placeholder:text-primary-300 focus:outline-none sm:text-base"
            />
        </div>
    );
}

/** Categorías del blog: crear, renombrar y borrar (sus artículos quedan sin categoría). */
function Categorias({ categorias, recargar }) {
    const { ejecutar, enCurso } = useAccionApi(recargar);
    const [nueva, setNueva] = useState('');
    const [editando, setEditando] = useState(null); // { id, nombre }

    const crear = async (e) => {
        e.preventDefault();
        if (!nueva.trim()) return;
        const { success } = await ejecutar('post', '/admin/categorias-blog', { nombre: nueva.trim(), orden: categorias.length });
        if (success) setNueva('');
    };

    const renombrar = async () => {
        const { success } = await ejecutar('put', `/admin/categorias-blog/${editando.id}`, { nombre: editando.nombre.trim() });
        if (success) setEditando(null);
    };

    const borrar = async (categoria) => {
        const texto = categoria.articulos_count ? `Sus ${categoria.articulos_count} artículo(s) quedarán sin categoría.` : undefined;
        if (await deleteConfirm(`¿Eliminar la categoría "${categoria.nombre}"?`, texto)) {
            ejecutar('delete', `/admin/categorias-blog/${categoria.id}`);
        }
    };

    return (
        <Panel title="Categorías" description="Se usan para ordenar el blog y filtrarlo.">
            <ul className="flex flex-col divide-y divide-gray-100">
                {categorias.map((categoria) => (
                    <li key={categoria.id} className="flex items-center gap-2 py-2">
                        {editando?.id === categoria.id ? (
                            <>
                                <Input
                                    value={editando.nombre}
                                    onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), renombrar())}
                                    aria-label="Nombre de la categoría"
                                    className="h-9 sm:h-9"
                                    autoFocus
                                />
                                <button type="button" onClick={renombrar} disabled={enCurso} aria-label="Guardar" className="rounded-lg p-2 text-green-700 hover:bg-green-50">
                                    <Check className="size-4" />
                                </button>
                                <button type="button" onClick={() => setEditando(null)} aria-label="Cancelar" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                                    <X className="size-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">{categoria.nombre}</span>
                                <span className="text-xs text-gray-400">{categoria.articulos_count}</span>
                                <button
                                    type="button"
                                    onClick={() => setEditando({ id: categoria.id, nombre: categoria.nombre })}
                                    aria-label={`Renombrar ${categoria.nombre}`}
                                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-primary"
                                >
                                    <Pencil className="size-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => borrar(categoria)}
                                    aria-label={`Eliminar ${categoria.nombre}`}
                                    className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
            <form onSubmit={crear} className="mt-3 flex gap-2">
                <Input value={nueva} onChange={(e) => setNueva(e.target.value)} placeholder="Nueva categoría" aria-label="Nueva categoría" className="h-9 sm:h-9" />
                <Button type="submit" variant="secondary" size="sm" icon={Plus} disabled={enCurso || !nueva.trim()}>
                    Agregar
                </Button>
            </form>
        </Panel>
    );
}

/** Blog de la empresa: artículos y categorías (GET /api/admin/articulos). */
export default function BlogIndex() {
    const lista = useConsulta('/admin/articulos');
    const articulos = lista.datos ?? [];
    const categorias = lista.respuesta?.opciones?.categorias ?? [];
    const crud = useCrudModal({
        url: '/admin/articulos',
        recargar: lista.recargar,
        vacio: VACIO,
        aFormulario: (a) => ({
            ...VACIO,
            ...a,
            slug: a.slug ?? '',
            categoria_blog_id: a.categoria_blog_id ?? '',
            resumen: a.resumen ?? '',
            video_url: a.video_url ?? '',
            autor: a.autor ?? '',
            publicado_at: a.publicado_at ?? '',
            portada: null,
            quitar_portada: false,
        }),
    });
    const { data, setData, errors, processing } = crud.form;

    const nuevo = (
        <Button variant="secondary" icon={Plus} onClick={() => crud.abrirNuevo()}>
            Nuevo artículo
        </Button>
    );

    return (
        <AdminLayout title="Blog">
            <PageHeader
                title="Blog"
                description="Artículos de la empresa: noticias, consejos y novedades. Se ven en /blog cuando están publicados y llega su fecha."
                actions={
                    <>
                        <Button href="/blog" newTab variant="ghost" icon={ExternalLink} className="border border-gray-200">
                            Ver blog
                        </Button>
                        {nuevo}
                    </>
                }
            />

            {!lista.datos ? (
                <Cargando error={lista.error} onReintentar={lista.recargar} />
            ) : (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                    <div>
                        {articulos.length === 0 ? (
                            <EmptyState icon={Newspaper} title="Todavía no hay artículos" description="Escribe el primero: una noticia, un consejo o una novedad." action={nuevo} />
                        ) : (
                            <ul className="flex flex-col gap-3">
                                {articulos.map((articulo) => {
                                    const estado = ESTADOS[articulo.estado];
                                    return (
                                        <li key={articulo.id} className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:flex-row sm:items-center">
                                            <div className="flex aspect-[16/10] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary sm:w-40">
                                                {articulo.portada_url ? (
                                                    <img src={articulo.portada_url} alt="" className="size-full object-cover" />
                                                ) : (
                                                    <Newspaper className="size-6 text-white/40" aria-label="Sin portada" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', estado.clases)}>{estado.texto}</span>
                                                    {articulo.destacado && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                                            <Star className="size-3 fill-current" aria-hidden="true" /> Destacado
                                                        </span>
                                                    )}
                                                    {articulo.categoria && (
                                                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                                            <Tags className="size-3" aria-hidden="true" /> {articulo.categoria.nombre}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="mt-1 font-bold text-gray-900">{articulo.titulo}</h3>
                                                <p className="text-xs text-gray-500">
                                                    {articulo.publicado_at ? fechaArticulo(articulo.publicado_at) : 'Sin fecha'} · {articulo.minutos_lectura} min de lectura
                                                </p>
                                            </div>
                                            {articulo.estado === 'publicado' && (
                                                <Button href={`/blog/${articulo.slug}`} newTab variant="ghost" size="sm" icon={Eye} className="shrink-0 border border-gray-200">
                                                    Ver
                                                </Button>
                                            )}
                                            <AccionesFila onEditar={() => crud.abrirEditar(articulo)} onEliminar={() => crud.eliminar(articulo, `el artículo "${articulo.titulo}"`)} />
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <div>
                        <Categorias categorias={categorias} recargar={lista.recargar} />
                    </div>
                </div>
            )}

            <Modal
                open={crud.abierto}
                onClose={crud.cerrar}
                maxWidth="max-w-4xl"
                title={crud.editando ? 'Editar artículo' : 'Nuevo artículo'}
                footer={
                    <>
                        <Button variant="ghost" onClick={crud.cerrar}>
                            Cancelar
                        </Button>
                        <Button type="submit" form="form-articulo" variant="secondary" icon={Save} disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </>
                }
            >
                <form id="form-articulo" onSubmit={crud.guardar} className="grid gap-5 sm:grid-cols-2">
                    <FormField label="Título" htmlFor="titulo" error={errors.titulo} required className="sm:col-span-2">
                        <Input id="titulo" value={data.titulo} onChange={(e) => setData('titulo', e.target.value)} error={errors.titulo} placeholder="Cómo pagar tu cuota sin salir de casa" />
                    </FormField>

                    <FormField
                        label="Resumen"
                        htmlFor="resumen"
                        error={errors.resumen}
                        hint={`Una o dos frases: van en la tarjeta y al compartir. ${data.resumen.length}/${MAX_RESUMEN}`}
                        className="sm:col-span-2"
                    >
                        <Textarea id="resumen" rows={2} maxLength={MAX_RESUMEN} value={data.resumen} onChange={(e) => setData('resumen', e.target.value)} error={errors.resumen} />
                    </FormField>

                    <div className="sm:col-span-2">
                        <ImageUpload
                            label="Portada"
                            actualUrl={crud.editando?.portada_url}
                            archivo={data.portada}
                            onArchivo={(archivo) => setData('portada', archivo)}
                            quitada={data.quitar_portada}
                            onQuitar={(valor) => setData('quitar_portada', valor)}
                            error={errors.portada}
                            hint="Horizontal, 1600×900 px. JPG o WEBP, máx. 4 MB."
                            aspect="aspect-[16/9]"
                        />
                    </div>

                    <FormField
                        label="Contenido"
                        htmlFor="contenido"
                        error={errors.contenido}
                        required
                        hint='Formato: "## " al inicio de una línea = subtítulo · "- " = viñeta · línea en blanco = nuevo párrafo · "Imagen" sube una foto y la pone donde está el cursor.'
                        className="sm:col-span-2"
                    >
                        <EditorContenido value={data.contenido} onChange={(valor) => setData('contenido', valor)} error={errors.contenido} />
                    </FormField>

                    <FormField label="Categoría" htmlFor="categoria_blog_id" error={errors.categoria_blog_id}>
                        <Select
                            id="categoria_blog_id"
                            value={data.categoria_blog_id}
                            onChange={(e) => setData('categoria_blog_id', e.target.value)}
                            placeholder="Sin categoría"
                            options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
                            error={errors.categoria_blog_id}
                        />
                    </FormField>
                    <FormField label="Autor (opcional)" htmlFor="autor" error={errors.autor}>
                        <Input id="autor" value={data.autor} onChange={(e) => setData('autor', e.target.value)} error={errors.autor} placeholder="Equipo CrediGo" />
                    </FormField>

                    <FormField label="Fecha de publicación" htmlFor="publicado_at" error={errors.publicado_at} hint="Vacío = cuando lo publiques. Con fecha futura queda programado.">
                        <Input
                            id="publicado_at"
                            type="datetime-local"
                            value={aHoraLocal(data.publicado_at)}
                            onChange={(e) => setData('publicado_at', aIso(e.target.value))}
                            error={errors.publicado_at}
                        />
                    </FormField>
                    <FormField label="Dirección en la web" htmlFor="slug" error={errors.slug} hint="Vacío = se arma con el título.">
                        <div className="flex items-center gap-2">
                            <span className="shrink-0 text-sm text-gray-500">/blog/</span>
                            <Input id="slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} error={errors.slug} placeholder="como-pagar-tu-cuota" />
                        </div>
                    </FormField>

                    <VideoInput
                        value={data.video_url}
                        onChange={(valor) => setData('video_url', valor)}
                        error={errors.video_url}
                        hint="Opcional. Va al final del artículo. Pega el enlace de YouTube, TikTok, Facebook o Vimeo."
                        className="sm:col-span-2"
                    />

                    <div className="rounded-xl bg-gray-50 px-4 py-3">
                        <Switch
                            label="Publicado"
                            description="Apagado = borrador (no se ve en el sitio)."
                            checked={data.publicado}
                            onChange={(valor) => setData('publicado', valor)}
                        />
                    </div>
                    <div className="rounded-xl bg-gray-50 px-4 py-3">
                        <Switch
                            label="Destacado"
                            description="Va en grande arriba del blog."
                            checked={data.destacado}
                            onChange={(valor) => setData('destacado', valor)}
                        />
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
