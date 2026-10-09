import { BookOpenText, CircleCheckBig, Clock, ExternalLink, FileText, IdCard, Mail, MapPin, Maximize2, Phone, Send, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AccionesContacto, DatoContacto, Tarjeta } from '@/components/admin/Detalle';
import { diasRestantes, estadoPlazo, fechaLocal } from '@/components/admin/reclamaciones/Plazo';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import { useFormApi } from '@/hooks/useFormApi';
import { formatoFecha } from '@/lib/fechas';
import { ETIQUETA_ADJUNTO, fechaSimple, tamanoArchivo } from '@/lib/reclamacion';
import { cn } from '@/lib/utils';

const dinero = (monto) => `S/ ${Number(monto ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Etiqueta del estado sobre el encabezado azul
const ESTADO = {
    atendido: ['Atendido', 'bg-emerald-500 text-white'],
    vencido: ['Plazo vencido', 'bg-red-500 text-white'],
    urgente: ['Pendiente', 'bg-accent text-primary'],
    a_tiempo: ['Pendiente', 'bg-accent text-primary'],
};

/** Filas "etiqueta: valor" del bien contratado (solo las que tienen dato). */
function FilasBien({ r }) {
    const producto = [r.producto_nombre, r.producto_marca, r.producto_modelo].filter(Boolean).join(' · ');
    const comprobante = [r.comprobante_texto, r.comprobante_numero].filter(Boolean).join(' ');
    const filas = [
        ['Tipo', r.tipo_bien === 'producto' ? 'Producto' : 'Servicio'],
        ['Descripción', r.descripcion_bien],
        producto && ['Producto', `${producto}${r.producto_codigo ? ` (código ${r.producto_codigo})` : ''}`],
        (comprobante || r.fecha_compra) && ['Comprobante', [comprobante, fechaSimple(r.fecha_compra)].filter(Boolean).join(' · ')],
        r.numero_contrato && ['Asociado / contrato', r.numero_contrato],
    ].filter(Boolean);

    return (
        <dl className="divide-y divide-gray-100 text-sm">
            {filas.map(([etiqueta, valor]) => (
                <div key={etiqueta} className="flex flex-col gap-0.5 py-2.5 first:pt-0 last:pb-0 sm:flex-row sm:gap-4">
                    <dt className="shrink-0 text-gray-500 sm:w-36">{etiqueta}</dt>
                    <dd className="text-gray-900">{valor}</dd>
                </div>
            ))}
        </dl>
    );
}

// Dirección firmada y temporal que da la API para cada adjunto (disco privado)
const urlAdjunto = (adjunto) => adjunto.url;

/** Nombre, tipo y peso de un adjunto, con enlace para abrirlo en otra pestaña. */
function CabeceraAdjunto({ adjunto, icono: Icono }) {
    return (
        <figcaption className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-3 py-2 text-sm">
            <span className="flex min-w-0 items-center gap-2">
                <Icono className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="truncate font-medium text-gray-900">{adjunto.nombre_original}</span>
                <span className="shrink-0 text-xs text-gray-500">
                    {ETIQUETA_ADJUNTO[adjunto.tipo]} · {tamanoArchivo(adjunto.tamano)}
                </span>
            </span>
            <a
                href={urlAdjunto(adjunto)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
                Abrir <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
        </figcaption>
    );
}

/**
 * Adjuntos de la hoja, a la vista: las fotos como imágenes (al tocarlas se ven en grande),
 * los PDF dentro de la ventana y los videos con su reproductor.
 */
function Adjuntos({ adjuntos }) {
    const [enGrande, setEnGrande] = useState(null);
    const imagenes = adjuntos.filter((a) => a.mime.startsWith('image/'));
    const pdfs = adjuntos.filter((a) => a.mime === 'application/pdf');
    const videos = adjuntos.filter((a) => a.mime.startsWith('video/'));
    const otros = adjuntos.filter((a) => !imagenes.includes(a) && !pdfs.includes(a) && !videos.includes(a));

    return (
        <div className="flex flex-col gap-4">
            {imagenes.length > 0 && (
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {imagenes.map((adjunto) => (
                        <li key={adjunto.id}>
                            <button
                                type="button"
                                onClick={() => setEnGrande(adjunto)}
                                aria-label={`Ver ${adjunto.nombre_original} en grande`}
                                className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200"
                            >
                                <img
                                    src={urlAdjunto(adjunto)}
                                    alt={adjunto.nombre_original}
                                    loading="lazy"
                                    className="size-full object-cover transition duration-300 group-hover:scale-105"
                                />
                                <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 text-left text-xs text-white">
                                    {ETIQUETA_ADJUNTO[adjunto.tipo]} · {tamanoArchivo(adjunto.tamano)}
                                </span>
                                <span className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100">
                                    <Maximize2 className="size-3.5" aria-hidden="true" />
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {pdfs.map((adjunto) => (
                <figure key={adjunto.id} className="overflow-hidden rounded-xl ring-1 ring-gray-200">
                    <CabeceraAdjunto adjunto={adjunto} icono={FileText} />
                    <iframe src={urlAdjunto(adjunto)} title={adjunto.nombre_original} className="h-[28rem] w-full bg-white" />
                </figure>
            ))}

            {videos.map((adjunto) => (
                <figure key={adjunto.id} className="overflow-hidden rounded-xl ring-1 ring-gray-200">
                    <CabeceraAdjunto adjunto={adjunto} icono={Video} />
                    <video src={urlAdjunto(adjunto)} controls preload="metadata" className="aspect-video w-full bg-black" />
                </figure>
            ))}

            {otros.map((adjunto) => (
                <figure key={adjunto.id} className="overflow-hidden rounded-xl ring-1 ring-gray-200">
                    <CabeceraAdjunto adjunto={adjunto} icono={FileText} />
                </figure>
            ))}

            {/* Foto en grande, sobre la ventana de la hoja */}
            <Modal
                open={Boolean(enGrande)}
                onClose={() => setEnGrande(null)}
                maxWidth="max-w-5xl"
                title={enGrande?.nombre_original}
                description={enGrande && `${ETIQUETA_ADJUNTO[enGrande.tipo]} · ${tamanoArchivo(enGrande.tamano)}`}
                bodyClassName="flex items-center justify-center bg-gray-900 p-2 sm:p-3"
            >
                {enGrande && <img src={urlAdjunto(enGrande)} alt={enGrande.nombre_original} className="max-h-[75dvh] w-auto max-w-full object-contain" />}
            </Modal>
        </div>
    );
}

/** Aviso del plazo legal en la columna de la respuesta. */
function AvisoPlazo({ r }) {
    const estado = estadoPlazo(r);
    const dias = diasRestantes(r.fecha_limite);
    const fecha = formatoFecha(fechaLocal(r.fecha_limite), false);

    return (
        <p
            className={cn(
                'flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm',
                estado === 'vencido' ? 'bg-red-50 text-red-800' : estado === 'urgente' ? 'bg-amber-50 text-amber-900' : 'bg-primary-50 text-primary',
            )}
        >
            <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
                {estado === 'vencido' ? (
                    <>
                        <strong>El plazo venció el {fecha}.</strong> Responde cuanto antes.
                    </>
                ) : (
                    <>
                        Tienes hasta el <strong>{fecha}</strong> ({dias === 1 ? 'mañana' : `faltan ${dias} días`}).
                    </>
                )}
            </span>
        </p>
    );
}

/**
 * Detalle de una hoja del Libro de Reclamaciones: quién reclama (con botones para contactarlo),
 * qué reclama y qué pide, el bien contratado, los adjuntos y la respuesta (se registra y se envía
 * por correo; después no se puede cambiar).
 */
export default function ReclamacionModal({ reclamacion: r, onClose, recargar }) {
    const form = useFormApi({ respuesta: '' });

    // Al abrir otra hoja, el formulario empieza vacío
    useEffect(() => {
        form.setData({ respuesta: '' });
        form.clearErrors();
    }, [r?.id]);

    const responder = (e) => {
        e.preventDefault();
        form.put(`/admin/reclamaciones/${r.id}/respuesta`, { recargar });
    };

    const estado = r ? estadoPlazo(r) : null;
    const [textoEstado, claseEstado] = estado ? ESTADO[estado] : [];
    const esReclamo = r?.tipo === 'reclamo';

    return (
        <Modal
            open={Boolean(r)}
            onClose={onClose}
            maxWidth="max-w-5xl"
            bodyClassName="bg-gray-50"
            header={
                r && (
                    <div className="bg-primary px-5 py-5 text-white sm:px-6">
                        <div className="flex items-center gap-4 pr-10">
                            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
                                <BookOpenText className="size-7" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                                <h2 className="text-xl font-bold tabular-nums">Hoja N.° {r.codigo}</h2>
                                <p className="text-sm text-primary-200">
                                    {esReclamo ? 'Reclamo' : 'Queja'} · registrada el {formatoFecha(r.created_at)}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                                    <span className={cn('rounded-full px-2.5 py-1', claseEstado)}>{textoEstado}</span>
                                    {r.estado === 'pendiente' && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1">
                                            <Clock className="size-3.5" aria-hidden="true" /> Vence el {formatoFecha(fechaLocal(r.fecha_limite), false)}
                                        </span>
                                    )}
                                    <span className="rounded-full bg-white/15 px-2.5 py-1 tabular-nums">Monto: {dinero(r.monto_reclamado)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        >
            {r && (
                <div className="grid gap-5 lg:grid-cols-5">
                    <div className="flex flex-col gap-5 lg:col-span-3">
                        <Tarjeta titulo="Consumidor">
                            <p className="text-lg font-bold text-gray-900">{r.nombre}</p>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <DatoContacto icono={IdCard} etiqueta={r.tipo_documento}>
                                    {r.numero_documento}
                                </DatoContacto>
                                <DatoContacto icono={Phone} etiqueta="Celular">
                                    {r.telefono}
                                </DatoContacto>
                                <DatoContacto icono={Mail} etiqueta="Correo">
                                    {r.email}
                                </DatoContacto>
                                <DatoContacto icono={MapPin} etiqueta="Dirección">
                                    {r.domicilio}
                                </DatoContacto>
                            </div>
                            {r.menor_de_edad && (
                                <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                                    <strong>Menor de edad.</strong> Apoderado: {r.apoderado} ({r.apoderado_tipo_documento} {r.apoderado_numero_documento})
                                </p>
                            )}
                            <AccionesContacto telefono={r.telefono} email={r.email} className="mt-4" />
                        </Tarjeta>

                        <Tarjeta titulo={esReclamo ? 'Qué reclama' : 'De qué se queja'}>
                            <p className="text-sm leading-relaxed whitespace-pre-line text-gray-800">{r.detalle}</p>
                            <div className="mt-4 border-t border-gray-100 pt-4">
                                <p className="text-sm font-semibold text-gray-900">Qué pide</p>
                                <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-gray-800">{r.pedido}</p>
                                {r.solucion_texto && (
                                    <p className="mt-3 inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">{r.solucion_texto}</p>
                                )}
                            </div>
                        </Tarjeta>

                        <Tarjeta titulo="Bien contratado">
                            <FilasBien r={r} />
                        </Tarjeta>

                        {r.adjuntos?.length > 0 && (
                            <Tarjeta titulo={`Archivos adjuntos (${r.adjuntos.length})`}>
                                <Adjuntos adjuntos={r.adjuntos} />
                            </Tarjeta>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        {r.estado === 'atendido' ? (
                            <Tarjeta titulo="Respuesta enviada" className="lg:sticky lg:top-0">
                                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                                    <CircleCheckBig className="size-4" aria-hidden="true" />
                                    {formatoFecha(r.respondido_at)}
                                    {r.respondido_por?.name && ` · ${r.respondido_por.name}`}
                                </p>
                                <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-gray-800">{r.respuesta}</p>
                                <p className="mt-4 text-xs text-gray-500">Se envió a {r.email} y quedó registrada en la hoja.</p>
                            </Tarjeta>
                        ) : (
                            <form onSubmit={responder} className="lg:sticky lg:top-0">
                                <Tarjeta titulo="Respuesta al consumidor" className="flex flex-col gap-4">
                                    <AvisoPlazo r={r} />
                                    <div>
                                        <label htmlFor="respuesta" className="sr-only">
                                            Respuesta al consumidor
                                        </label>
                                        <Textarea
                                            id="respuesta"
                                            rows={9}
                                            value={form.data.respuesta}
                                            onChange={(e) => form.setData('respuesta', e.target.value)}
                                            error={form.errors.respuesta}
                                            placeholder="Escribe la respuesta: qué revisaron y qué solución se le da."
                                        />
                                        {form.errors.respuesta ? (
                                            <p className="mt-1 text-sm text-red-600" role="alert">
                                                {form.errors.respuesta}
                                            </p>
                                        ) : (
                                            <p className="mt-1.5 text-xs text-gray-500">
                                                Se enviará a <strong className="font-semibold text-gray-700">{r.email}</strong> y quedará registrada en la hoja. Después
                                                no se puede cambiar.
                                            </p>
                                        )}
                                    </div>
                                    <Button type="submit" variant="secondary" icon={Send} fullWidth disabled={form.processing || !form.data.respuesta.trim()}>
                                        {form.processing ? 'Enviando...' : 'Registrar y enviar respuesta'}
                                    </Button>
                                </Tarjeta>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </Modal>
    );
}
