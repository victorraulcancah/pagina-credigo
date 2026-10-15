import { ExternalLink, Eye, MessageSquareQuote, Plus, Save, ShieldAlert, Star } from 'lucide-react';
import AccionesFila from '@/components/admin/AccionesFila';
import Cargando from '@/components/admin/Cargando';
import EmptyState from '@/components/admin/EmptyState';
import EstadoBadge from '@/components/admin/EstadoBadge';
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
import { FotoConductor } from '@/components/web/Testimonios';
import { useConsulta } from '@/hooks/useConsulta';
import { useCrudModal } from '@/hooks/useCrudModal';

const MAX_COMENTARIO = 400;

const MAX_HISTORIA = 10000;

const VACIO = {
    nombre: '',
    slug: '',
    titulo: '',
    historia: '',
    ciudad: '',
    comentario: '',
    foto: null,
    quitar_foto: false,
    foto_vehiculo: null,
    quitar_foto_vehiculo: false,
    vehiculo: '',
    calificacion: '',
    video_url: '',
    autorizado: false,
    orden: 0,
    activo: true,
};

const CALIFICACIONES = [5, 4, 3, 2, 1].map((n) => ({ value: n, label: `${n} ${n === 1 ? 'estrella' : 'estrellas'}` }));

/** Historias de conductores (testimonios): los pide a la API (GET /api/admin/testimonios). */
export default function TestimoniosIndex() {
    const lista = useConsulta('/admin/testimonios');
    const testimonios = lista.datos ?? [];
    const crud = useCrudModal({
        url: '/admin/testimonios',
        recargar: lista.recargar,
        vacio: VACIO,
        aFormulario: (t) => ({
            ...VACIO,
            ...t,
            ciudad: t.ciudad ?? '',
            slug: t.slug ?? '',
            titulo: t.titulo ?? '',
            historia: t.historia ?? '',
            vehiculo: t.vehiculo ?? '',
            video_url: t.video_url ?? '',
            calificacion: t.calificacion ?? '',
            foto: null,
            quitar_foto: false,
            foto_vehiculo: null,
            quitar_foto_vehiculo: false,
        }),
    });
    const { data, setData, errors, processing } = crud.form;

    const nuevo = (
        <Button variant="secondary" icon={Plus} onClick={() => crud.abrirNuevo({ orden: testimonios.length })}>
            Nueva historia
        </Button>
    );

    return (
        <AdminLayout title="Testimonios">
            <PageHeader
                title="Testimonios"
                description="Historias de conductores que recibieron su vehículo. Cada una tiene su propia página (como un blog); las primeras 8 van además en el carrusel del inicio. Solo se publican las que tienen la autorización del conductor."
                actions={
                    <>
                        {testimonios.some((t) => t.activo && t.autorizado) && (
                            <Button href="/historias" newTab variant="ghost" icon={ExternalLink} className="border border-gray-200">
                                Ver historias
                            </Button>
                        )}
                        {nuevo}
                    </>
                }
            />

            {!lista.datos ? (
                <Cargando error={lista.error} onReintentar={lista.recargar} />
            ) : testimonios.length === 0 ? (
                <EmptyState
                    icon={MessageSquareQuote}
                    title="Todavía no hay historias"
                    description="Mientras no publiques ninguna, la sección de historias no aparece en el inicio."
                    action={nuevo}
                />
            ) : (
                <ul className="flex flex-col gap-3">
                    {testimonios.map((testimonio) => (
                        <li key={testimonio.id} className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:flex-row sm:items-center">
                            <FotoConductor testimonio={testimonio} className="size-16 shrink-0 rounded-full text-lg" />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <EstadoBadge activo={testimonio.activo} />
                                    {!testimonio.autorizado && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                                            <ShieldAlert className="size-3" aria-hidden="true" /> Falta la autorización
                                        </span>
                                    )}
                                    {testimonio.calificacion && (
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
                                            <Star className="size-3 fill-current" aria-hidden="true" /> {testimonio.calificacion}
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-400">Orden {testimonio.orden}</span>
                                </div>
                                <h3 className="mt-1 font-bold text-gray-900">
                                    {testimonio.nombre}
                                    {testimonio.ciudad && <span className="font-normal text-gray-500"> · {testimonio.ciudad}</span>}
                                </h3>
                                <p className="line-clamp-2 text-sm text-gray-500">“{testimonio.comentario}”</p>
                                {testimonio.vehiculo && <p className="mt-1 text-xs text-gray-400">{testimonio.vehiculo}</p>}
                            </div>
                            {testimonio.foto_vehiculo_url && (
                                <img src={testimonio.foto_vehiculo_url} alt="" className="hidden h-16 w-24 shrink-0 rounded-lg object-contain sm:block" />
                            )}
                            {testimonio.activo && testimonio.autorizado && (
                                <Button href={`/historias/${testimonio.slug}`} newTab variant="ghost" size="sm" icon={Eye} className="shrink-0 border border-gray-200">
                                    Ver
                                </Button>
                            )}
                            <AccionesFila onEditar={() => crud.abrirEditar(testimonio)} onEliminar={() => crud.eliminar(testimonio, `la historia de ${testimonio.nombre}`)} />
                        </li>
                    ))}
                </ul>
            )}

            <Modal
                open={crud.abierto}
                onClose={crud.cerrar}
                title={crud.editando ? 'Editar historia' : 'Nueva historia'}
                footer={
                    <>
                        <Button variant="ghost" onClick={crud.cerrar}>
                            Cancelar
                        </Button>
                        <Button type="submit" form="form-testimonio" variant="secondary" icon={Save} disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </>
                }
            >
                <form id="form-testimonio" onSubmit={crud.guardar} className="grid gap-5 sm:grid-cols-2">
                    <div className="rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200 sm:col-span-2">
                        <Switch
                            label="Tengo la autorización del conductor"
                            description="Por escrito, para publicar su nombre, su foto y su comentario (Ley 29733). Sin ella la historia solo se puede guardar oculta."
                            checked={data.autorizado}
                            onChange={(valor) => setData('autorizado', valor)}
                        />
                        {errors.autorizado && <p className="mt-2 text-sm font-medium text-red-600">{errors.autorizado}</p>}
                    </div>

                    <div>
                        <ImageUpload
                            label="Foto del conductor"
                            actualUrl={crud.editando?.foto_url}
                            archivo={data.foto}
                            onArchivo={(archivo) => setData('foto', archivo)}
                            quitada={data.quitar_foto}
                            onQuitar={(valor) => setData('quitar_foto', valor)}
                            error={errors.foto}
                            hint="Vertical o cuadrada, con la cara al centro. JPG o WEBP, máx. 4 MB. Sin foto se muestran sus iniciales."
                            aspect="aspect-[4/5]"
                        />
                    </div>
                    <div>
                        <ImageUpload
                            label="Foto del vehículo o de la entrega (opcional)"
                            actualUrl={crud.editando?.foto_vehiculo_url}
                            archivo={data.foto_vehiculo}
                            onArchivo={(archivo) => setData('foto_vehiculo', archivo)}
                            quitada={data.quitar_foto_vehiculo}
                            onQuitar={(valor) => setData('quitar_foto_vehiculo', valor)}
                            error={errors.foto_vehiculo}
                            hint="Mejor una foto real de la entrega. Si es el auto solo, en PNG con fondo transparente. Máx. 4 MB."
                            aspect="aspect-[4/3]"
                        />
                    </div>

                    <FormField label="Nombre" htmlFor="nombre" error={errors.nombre} required hint="Como quiere aparecer (ej. solo su nombre).">
                        <Input id="nombre" value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} error={errors.nombre} placeholder="Edimar" />
                    </FormField>
                    <FormField label="Ciudad" htmlFor="ciudad" error={errors.ciudad}>
                        <Input id="ciudad" value={data.ciudad} onChange={(e) => setData('ciudad', e.target.value)} error={errors.ciudad} placeholder="Arequipa" />
                    </FormField>

                    <FormField
                        label="Titular (opcional)"
                        htmlFor="titulo"
                        error={errors.titulo}
                        hint='Título de su página. Vacío = "La historia de {nombre}".'
                        className="sm:col-span-2"
                    >
                        <Input id="titulo" value={data.titulo} onChange={(e) => setData('titulo', e.target.value)} error={errors.titulo} placeholder="Del aplicativo a mi propio auto" />
                    </FormField>

                    <FormField
                        label="Comentario"
                        htmlFor="comentario"
                        error={errors.comentario}
                        required
                        hint={`Frase corta con sus propias palabras: va en el carrusel del inicio y en las tarjetas. ${data.comentario.length}/${MAX_COMENTARIO} caracteres.`}
                        className="sm:col-span-2"
                    >
                        <Textarea
                            id="comentario"
                            rows={3}
                            maxLength={MAX_COMENTARIO}
                            value={data.comentario}
                            onChange={(e) => setData('comentario', e.target.value)}
                            error={errors.comentario}
                            placeholder="Me siento feliz de haber recibido mi carro y poder cumplir mi sueño gracias a CrediGo."
                        />
                    </FormField>

                    <FormField
                        label="Historia completa (opcional)"
                        htmlFor="historia"
                        error={errors.historia}
                        hint={`Se lee en su página. Deja una línea en blanco entre párrafos. ${data.historia.length}/${MAX_HISTORIA} caracteres.`}
                        className="sm:col-span-2"
                    >
                        <Textarea
                            id="historia"
                            rows={8}
                            maxLength={MAX_HISTORIA}
                            value={data.historia}
                            onChange={(e) => setData('historia', e.target.value)}
                            error={errors.historia}
                            placeholder="Cómo conoció CrediGo, cómo fue ahorrar cada semana, el día que recibió su vehículo..."
                        />
                    </FormField>

                    <FormField label="Vehículo o plan" htmlFor="vehiculo" error={errors.vehiculo} hint="Opcional. Ej. KIA Soluto · CrediYango">
                        <Input id="vehiculo" value={data.vehiculo} onChange={(e) => setData('vehiculo', e.target.value)} error={errors.vehiculo} />
                    </FormField>
                    <FormField label="Calificación" htmlFor="calificacion" error={errors.calificacion} hint="Solo si la dio el propio conductor.">
                        <Select
                            id="calificacion"
                            value={data.calificacion}
                            onChange={(e) => setData('calificacion', e.target.value)}
                            placeholder="Sin calificación"
                            options={CALIFICACIONES}
                            error={errors.calificacion}
                        />
                    </FormField>

                    <VideoInput
                        value={data.video_url}
                        onChange={(valor) => setData('video_url', valor)}
                        error={errors.video_url}
                        hint='Opcional. Agrega "Ver su historia en video". Pega el enlace de YouTube, TikTok, Facebook o Vimeo.'
                        className="sm:col-span-2"
                    />

                    <FormField
                        label="Dirección en la web"
                        htmlFor="slug"
                        error={errors.slug}
                        hint="Vacío = se arma con el nombre. Solo minúsculas, números y guiones."
                        className="sm:col-span-2"
                    >
                        <div className="flex items-center gap-2">
                            <span className="shrink-0 text-sm text-gray-500">/historias/</span>
                            <Input id="slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} error={errors.slug} placeholder="edimar-rios" />
                        </div>
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
