import { ExternalLink, Eye, Newspaper, Plus, Save, Star, Tags } from 'lucide-react';
import { useState } from 'react';
import AccionesFila from '@/components/admin/AccionesFila';
import Cargando from '@/components/admin/Cargando';
import EmptyState from '@/components/admin/EmptyState';
import ConstructorArticulo from '@/components/admin/ConstructorArticulo';
import ImageUpload from '@/components/admin/ImageUpload';
import PageHeader from '@/components/admin/PageHeader';
import VideoInput from '@/components/admin/VideoInput';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Switch from '@/components/ui/Switch';
import Textarea from '@/components/ui/Textarea';
import { fechaArticulo, urlArticulo } from '@/components/web/Blog';
import { useConsulta } from '@/hooks/useConsulta';
import { useCrudModal } from '@/hooks/useCrudModal';
import { bloqueDeTexto, contenidoABloques } from '@/lib/contenidoArticulo';
import { cn } from '@/lib/utils';

const MAX_RESUMEN = 300;

const VACIO = {
    titulo: '',
    slug: '',
    categoria_blog_id: '',
    resumen: '',
    bloques: [bloqueDeTexto()],
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

/** Blog de la empresa: artículos en Eventos, Noticias o Tendencias (GET /api/admin/articulos). */
export default function BlogIndex() {
    const lista = useConsulta('/admin/articulos');
    const articulos = lista.datos ?? [];
    const categorias = lista.respuesta?.opciones?.categorias ?? [];
    const crud = useCrudModal({
        url: '/admin/articulos',
        recargar: lista.recargar,
        vacio: VACIO,
        aFormulario: ({ contenido, ...a }) => ({
            ...VACIO,
            ...a,
            // Los artículos anteriores (texto suelto) se abren ya separados en bloques de texto y de fotos
            bloques: a.bloques?.length ? a.bloques : contenidoABloques(contenido),
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
                description="Artículos de la empresa en Eventos, Noticias o Tendencias. Se ven en /blog (y en la página de su categoría) cuando están publicados y llega su fecha."
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
                <div>
                    <div>
                        {articulos.length === 0 ? (
                            <EmptyState icon={Newspaper} title="Todavía no hay artículos" description="Escribe el primero: un evento, una noticia o una tendencia." action={nuevo} />
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
                                                <Button href={urlArticulo(articulo)} newTab variant="ghost" size="sm" icon={Eye} className="shrink-0 border border-gray-200">
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
                        error={errors.bloques || errors.contenido}
                        required
                        hint="El artículo se arma con bloques en orden: de Texto (con colores, tamaños y alineación) y de Fotos (cada uno con su tamaño, diseño y animación). Súbelos o bájalos con las flechas."
                        className="sm:col-span-2"
                    >
                        <ConstructorArticulo bloques={data.bloques} onChange={(bloques) => setData('bloques', bloques)} />
                    </FormField>

                    <FormField label="Categoría" htmlFor="categoria_blog_id" error={errors.categoria_blog_id} required>
                        <Select
                            id="categoria_blog_id"
                            value={data.categoria_blog_id}
                            onChange={(e) => setData('categoria_blog_id', e.target.value)}
                            placeholder="Elige una categoría"
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
                            <span className="shrink-0 text-sm text-gray-500">/blog/{categorias.find((c) => String(c.id) === String(data.categoria_blog_id))?.slug ?? '…'}/</span>
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
