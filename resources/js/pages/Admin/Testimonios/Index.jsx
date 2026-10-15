import { CircleCheck, ExternalLink, Film, Link2, MessageSquareQuote, PlayCircle, Plus, RotateCcw, Save, ShieldAlert, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AccionesFila from '@/components/admin/AccionesFila';
import Cargando from '@/components/admin/Cargando';
import EmptyState from '@/components/admin/EmptyState';
import EstadoBadge from '@/components/admin/EstadoBadge';
import ImageUpload from '@/components/admin/ImageUpload';
import PageHeader from '@/components/admin/PageHeader';
import AdminLayout from '@/components/layout/AdminLayout';
import ArchivoInput from '@/components/ui/ArchivoInput';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Switch from '@/components/ui/Switch';
import Textarea from '@/components/ui/Textarea';
import { FotoConductor, REDES_VIDEO } from '@/components/web/Testimonios';
import Video, { VentanaVideo } from '@/components/web/Video';
import { useConsulta } from '@/hooks/useConsulta';
import { useCrudModal } from '@/hooks/useCrudModal';
import { cn } from '@/lib/utils';
import { esEnlaceCortoTiktok, parsearVideo } from '@/lib/video';

const MAX_COMENTARIO = 400;
const VIDEO_MAX_MB = 100;

const VACIO = {
    nombre: '',
    ciudad: '',
    comentario: '',
    foto: null,
    quitar_foto: false,
    foto_vehiculo: null,
    quitar_foto_vehiculo: false,
    vehiculo: '',
    calificacion: '',
    tiktok_url: '',
    youtube_url: '',
    facebook_url: '',
    video: null,
    quitar_video: false,
    autorizado: false,
    orden: 0,
    activo: true,
};

const CALIFICACIONES = [5, 4, 3, 2, 1].map((n) => ({ value: n, label: `${n} ${n === 1 ? 'estrella' : 'estrellas'}` }));

// Qué enlace sirve en cada red (el de Compartir del celular sirve en TikTok y YouTube)
const AYUDA_RED = {
    tiktok_url: 'Sirve el de Compartir del celular (vm.tiktok.com/…): al guardar se completa solo.',
    youtube_url: 'Sirve el de Compartir (youtu.be/…), el del navegador o el de un short.',
    facebook_url: 'Abre el video en el navegador y copia el enlace (los de fb.watch no sirven).',
};

/**
 * Enlace del video en una red, con su ícono. Avisa al instante si el enlace es de otra red o no
 * se reconoce, y si está bien deja verlo en una ventana antes de guardar. El servidor valida igual (VideoRegla).
 */
function EnlaceRed({ red, value, onChange, error }) {
    const [probando, setProbando] = useState(false);
    const video = parsearVideo(value);
    const deEstaRed = video?.proveedor === red.nombre;
    const corto = red.campo === 'tiktok_url' && esEnlaceCortoTiktok(value);

    let estado = null;
    if (error) estado = <p className="text-sm text-red-600" role="alert">{error}</p>;
    else if (deEstaRed)
        estado = (
            <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                <CircleCheck className="size-4 shrink-0" aria-hidden="true" /> Video de {red.nombre} listo: en la historia sale su ícono.
            </p>
        );
    else if (corto) estado = <p className="text-sm text-primary-700">Enlace corto de TikTok: al guardar se completa solo.</p>;
    else if (value && video) estado = <p className="text-sm text-amber-700">Este enlace es de {video.proveedor}, no de {red.nombre}. Pégalo en su casilla.</p>;
    else if (value) estado = <p className="text-sm text-amber-700">No reconocemos este enlace. Abre el video y copia el enlace completo.</p>;
    else estado = <p className="text-sm text-primary-400">{AYUDA_RED[red.campo]}</p>;

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={red.campo} className="flex items-center gap-2 text-sm font-semibold text-primary">
                <span className={cn('flex size-7 items-center justify-center rounded-full bg-white ring-1 ring-gray-200', red.color)}>
                    <red.icono className="size-3.5" aria-hidden="true" />
                </span>
                {red.nombre}
            </label>
            <div className="flex gap-2">
                <Input
                    id={red.campo}
                    inputMode="url"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    error={error}
                    placeholder={red.placeholder}
                    className="min-w-0"
                />
                {deEstaRed && (
                    <Button type="button" variant="ghost" icon={PlayCircle} onClick={() => setProbando(true)} className="shrink-0 border border-gray-200 bg-white">
                        Ver
                    </Button>
                )}
            </div>
            {estado}
            {deEstaRed && <VentanaVideo url={value} titulo={`Vista previa · ${red.nombre}`} abierto={probando} onClose={() => setProbando(false)} />}
        </div>
    );
}

/** En la lista: qué videos tiene cada historia (íconos de las redes y el subido). */
function VideosDeLaHistoria({ testimonio }) {
    const redes = REDES_VIDEO.filter((red) => testimonio[red.campo]);
    if (!redes.length && !testimonio.video_archivo_url) return null;

    return (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Videos">
            {testimonio.video_archivo_url && (
                <li className="inline-flex h-6 items-center gap-1 rounded-full bg-primary px-2 text-[0.6875rem] font-semibold text-white">
                    <Film className="size-3" aria-hidden="true" /> Video propio
                </li>
            )}
            {redes.map((red) => (
                <li key={red.campo} title={red.nombre} className={cn('flex size-6 items-center justify-center rounded-full bg-gray-100', red.color)}>
                    <red.icono className="size-3" aria-label={red.nombre} />
                </li>
            ))}
        </ul>
    );
}

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
            vehiculo: t.vehiculo ?? '',
            tiktok_url: t.tiktok_url ?? '',
            youtube_url: t.youtube_url ?? '',
            facebook_url: t.facebook_url ?? '',
            video: null,
            quitar_video: false,
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
                description="Historias de conductores que recibieron su vehículo. Las primeras 8 van en el inicio y todas en la página Historias. Solo se publican las que tienen la autorización del conductor."
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
                                <VideosDeLaHistoria testimonio={testimonio} />
                            </div>
                            {testimonio.foto_vehiculo_url && (
                                <img src={testimonio.foto_vehiculo_url} alt="" className="hidden h-16 w-24 shrink-0 rounded-lg object-contain sm:block" />
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
                        label="Comentario"
                        htmlFor="comentario"
                        error={errors.comentario}
                        required
                        hint={`Con sus propias palabras. ${data.comentario.length}/${MAX_COMENTARIO} caracteres.`}
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

                    {/* Videos: un enlace por red (en la historia sale un ícono por cada uno) y el video propio, que se ve dentro de la historia */}
                    <div className="flex flex-col gap-5 rounded-xl bg-gray-50 p-4 sm:col-span-2 sm:p-5">
                        <div>
                            <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                <Link2 className="size-4 text-primary" aria-hidden="true" /> Su video en redes (opcional)
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">Pega el enlace de su video en cada red. En la historia sale un ícono por cada una y el video se abre ahí mismo.</p>
                        </div>
                        {REDES_VIDEO.map((red) => (
                            <EnlaceRed key={red.campo} red={red} value={data[red.campo]} onChange={(valor) => setData(red.campo, valor)} error={errors[red.campo]} />
                        ))}

                        <div className="border-t border-gray-200 pt-5">
                            <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                <Film className="size-4 text-primary" aria-hidden="true" /> Video propio (opcional)
                            </p>
                            <p className="mt-0.5 mb-3 text-xs text-gray-500">El que grabaste o te mandó el conductor. Se reproduce dentro de la misma historia, sobre su foto.</p>
                            {crud.editando?.video_archivo_url && !data.video && (
                                <div className="mb-3 flex flex-wrap items-start gap-4">
                                    {data.quitar_video ? (
                                        <p className="flex items-center gap-2 text-sm text-amber-700">
                                            El video subido se quitará al guardar.
                                            <button
                                                type="button"
                                                onClick={() => setData('quitar_video', false)}
                                                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                                            >
                                                <RotateCcw className="size-3.5" aria-hidden="true" /> Deshacer
                                            </button>
                                        </p>
                                    ) : (
                                        <>
                                            <Video key={crud.editando.video_archivo_url} url={crud.editando.video_archivo_url} titulo="Video subido" className="ml-0 max-w-[13rem]" />
                                            <Button type="button" variant="ghost" size="sm" icon={Trash2} onClick={() => setData('quitar_video', true)} className="border border-gray-200">
                                                Quitar video
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                            <ArchivoInput
                                id="video"
                                icon={Film}
                                titulo={crud.editando?.video_archivo_url ? 'Reemplazar el video' : 'Elige o arrastra el video'}
                                formatos={`MP4 (recomendado), MOV o WEBM. Máx. ${VIDEO_MAX_MB} MB.`}
                                accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
                                maxMb={VIDEO_MAX_MB}
                                value={data.video}
                                onChange={(archivo) => setData('video', archivo)}
                                error={errors.video}
                                // A su medida: con h-full se estiraba al alto de todo el formulario y tapaba los campos de abajo
                                className="h-auto"
                            />
                            {processing && data.video && (
                                <p className="mt-2 text-sm text-gray-500">
                                    Subiendo el video{crud.form.progress ? ` (${crud.form.progress.percentage ?? Math.round((crud.form.progress.loaded / crud.form.progress.total) * 100)} %)` : ''}… no cierres la ventana.
                                </p>
                            )}
                        </div>
                    </div>

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
