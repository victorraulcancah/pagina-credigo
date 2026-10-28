import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ImagePlus, Trash2, Type } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import EditorRico from '@/components/admin/EditorRico';
import BloqueFotos from '@/components/web/BloqueFotos';
import api, { erroresDeValidacion, mensajeDeError } from '@/lib/api';
import { bloqueDeFotos, bloqueDeTexto } from '@/lib/contenidoArticulo';
import { cn } from '@/lib/utils';
import { errorAlert } from '@/utils/sweetalert';

const MAX_FOTOS_POR_BLOQUE = 12;

const DISENOS = [
    { value: 'galeria', label: 'Galería: en columnas' },
    { value: 'unica', label: 'Una debajo de otra' },
    { value: 'carrusel', label: 'Carrusel: se desliza' },
];
const COLUMNAS = [
    { value: 2, label: '2 columnas' },
    { value: 3, label: '3 columnas' },
    { value: 4, label: '4 columnas' },
];
const TAMANOS = [
    { value: 'pequena', label: 'Pequeño' },
    { value: 'mediana', label: 'Mediano' },
    { value: 'grande', label: 'Grande (ancho del texto)' },
    { value: 'completo', label: 'Ancho completo (más que el texto)' },
];
const ALINEACIONES = [
    { value: 'izquierda', label: 'Izquierda' },
    { value: 'centro', label: 'Centro' },
    { value: 'derecha', label: 'Derecha' },
];
const PROPORCIONES = [
    { value: 'original', label: 'Original: sin recortar' },
    { value: 'horizontal', label: 'Horizontal (3:2)' },
    { value: 'cuadrada', label: 'Cuadrada (1:1)' },
    { value: 'vertical', label: 'Vertical (3:4)' },
];
const ANIMACIONES = [
    { value: 'zoom', label: 'Acercar' },
    { value: 'abajo', label: 'Subir' },
    { value: 'izquierda', label: 'Entrar desde la izquierda' },
    { value: 'derecha', label: 'Entrar desde la derecha' },
    { value: 'ninguna', label: 'Sin animación' },
];

const nuevaClave = () => Math.random().toString(36).slice(2, 10);

const campo = 'h-9 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-800 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400';

function Opcion({ etiqueta, children }) {
    return (
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            {etiqueta}
            {children}
        </label>
    );
}

function Selector({ valor, onChange, opciones, ...props }) {
    return (
        <select value={valor} onChange={(e) => onChange(e.target.value)} className={campo} {...props}>
            {opciones.map((opcion) => (
                <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                </option>
            ))}
        </select>
    );
}

/** Lo que se ve en la web, con las opciones elegidas (sin animación). */
function VistaPrevia({ bloque }) {
    return (
        <div className="overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3">
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">Vista previa</p>
            <div className="contenido-rico">
                <BloqueFotos bloque={bloque} />
            </div>
        </div>
    );
}

function EditorFotos({ bloque, onChange }) {
    const archivo = useRef(null);
    const [subiendo, setSubiendo] = useState(false);
    const cambiar = (cambios) => onChange({ ...bloque, ...cambios });
    const fotos = bloque.fotos;

    const subir = async (e) => {
        const elegidas = Array.from(e.target.files ?? []).slice(0, MAX_FOTOS_POR_BLOQUE - fotos.length);
        e.target.value = '';
        if (!elegidas.length) return;

        setSubiendo(true);
        const nuevas = [];
        try {
            for (const imagen of elegidas) {
                const datos = new FormData();
                datos.append('imagen', imagen);
                const respuesta = await api.post('/admin/articulos/imagenes', datos);
                nuevas.push({ src: respuesta.data.data.url, alt: '' });
            }
        } catch (err) {
            errorAlert('No se pudo subir la imagen', Object.values(erroresDeValidacion(err))[0] ?? mensajeDeError(err));
        } finally {
            // Las que sí se subieron se agregan igual
            if (nuevas.length) cambiar({ fotos: [...fotos, ...nuevas] });
            setSubiendo(false);
        }
    };

    const cambiarFoto = (i, cambios) => cambiar({ fotos: fotos.map((foto, j) => (j === i ? { ...foto, ...cambios } : foto)) });
    const moverFoto = (i, paso) => {
        const destino = i + paso;
        if (destino < 0 || destino >= fotos.length) return;
        const copia = [...fotos];
        [copia[i], copia[destino]] = [copia[destino], copia[i]];
        cambiar({ fotos: copia });
    };

    return (
        <div className="flex flex-col gap-4">
            {fotos.length > 0 && (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {fotos.map((foto, i) => (
                        <li key={`${foto.src}-${i}`} className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-2">
                            <img src={foto.src} alt="" className="aspect-[3/2] w-full rounded-lg bg-gray-100 object-cover" />
                            <input
                                value={foto.alt ?? ''}
                                onChange={(e) => cambiarFoto(i, { alt: e.target.value })}
                                maxLength={200}
                                placeholder="Pie de foto (opcional)"
                                aria-label={`Pie de la foto ${i + 1}`}
                                className="h-8 rounded-lg border border-gray-200 px-2 text-sm focus:border-primary focus:outline-none"
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">Foto {i + 1}</span>
                                <div className="flex gap-1">
                                    <button type="button" aria-label="Mover antes" title="Mover antes" disabled={i === 0} onClick={() => moverFoto(i, -1)} className="flex size-7 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30">
                                        <ArrowLeft className="size-4" aria-hidden="true" />
                                    </button>
                                    <button type="button" aria-label="Mover después" title="Mover después" disabled={i === fotos.length - 1} onClick={() => moverFoto(i, 1)} className="flex size-7 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30">
                                        <ArrowRight className="size-4" aria-hidden="true" />
                                    </button>
                                    <button type="button" aria-label="Quitar foto" title="Quitar foto" onClick={() => cambiar({ fotos: fotos.filter((_, j) => j !== i) })} className="flex size-7 items-center justify-center rounded-lg text-red-600 hover:bg-red-50">
                                        <Trash2 className="size-4" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <div>
                <button
                    type="button"
                    onClick={() => archivo.current?.click()}
                    disabled={subiendo || fotos.length >= MAX_FOTOS_POR_BLOQUE}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 transition hover:border-primary hover:text-primary disabled:opacity-50"
                >
                    <ImagePlus className="size-4" aria-hidden="true" /> {subiendo ? 'Subiendo...' : fotos.length ? 'Agregar más fotos' : 'Subir fotos'}
                </button>
                <input ref={archivo} type="file" multiple accept="image/png,image/jpeg,image/webp" className="hidden" onChange={subir} />
                <span className="ml-3 text-xs text-gray-500">Hasta {MAX_FOTOS_POR_BLOQUE} por bloque · JPG, PNG o WEBP, máx. 4 MB cada una.</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Opcion etiqueta="Diseño">
                    <Selector valor={bloque.diseno} onChange={(diseno) => cambiar({ diseno })} opciones={DISENOS} />
                </Opcion>
                <Opcion etiqueta="Columnas (en galería)">
                    <Selector valor={bloque.columnas} onChange={(columnas) => cambiar({ columnas: Number(columnas) })} opciones={COLUMNAS} disabled={bloque.diseno !== 'galeria'} />
                </Opcion>
                <Opcion etiqueta="Tamaño del bloque">
                    <Selector valor={bloque.tamano} onChange={(tamano) => cambiar({ tamano })} opciones={TAMANOS} />
                </Opcion>
                <Opcion etiqueta="Alineación">
                    <Selector valor={bloque.alineacion} onChange={(alineacion) => cambiar({ alineacion })} opciones={ALINEACIONES} disabled={bloque.tamano === 'grande' || bloque.tamano === 'completo'} />
                </Opcion>
                <Opcion etiqueta="Forma de las fotos">
                    <Selector valor={bloque.proporcion} onChange={(proporcion) => cambiar({ proporcion })} opciones={PROPORCIONES} />
                </Opcion>
                <Opcion etiqueta="Animación al bajar">
                    <Selector valor={bloque.animacion} onChange={(animacion) => cambiar({ animacion })} opciones={ANIMACIONES} />
                </Opcion>
            </div>

            {fotos.length > 0 && <VistaPrevia bloque={bloque} />}
        </div>
    );
}

function Tarjeta({ titulo, icono: Icono, indice, total, onMover, onQuitar, children }) {
    const boton = 'flex size-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-white hover:text-primary disabled:opacity-30';

    return (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <header className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2">
                <Icono className="size-4 text-primary" aria-hidden="true" />
                <h3 className="flex-1 text-sm font-semibold text-gray-900">
                    {titulo} <span className="font-normal text-gray-400">· bloque {indice + 1}</span>
                </h3>
                <button type="button" aria-label="Subir bloque" title="Subir bloque" disabled={indice === 0} onClick={() => onMover(-1)} className={boton}>
                    <ArrowUp className="size-4" aria-hidden="true" />
                </button>
                <button type="button" aria-label="Bajar bloque" title="Bajar bloque" disabled={indice === total - 1} onClick={() => onMover(1)} className={boton}>
                    <ArrowDown className="size-4" aria-hidden="true" />
                </button>
                <button type="button" aria-label="Quitar bloque" title="Quitar bloque" onClick={onQuitar} className={cn(boton, 'text-red-600 hover:bg-red-50 hover:text-red-700')}>
                    <Trash2 className="size-4" aria-hidden="true" />
                </button>
            </header>
            <div className="p-3 sm:p-4">{children}</div>
        </section>
    );
}

/**
 * El artículo como bloques en orden: de texto (editor con formato) y de fotos (cada uno con su tamaño,
 * diseño, forma y animación). Se agregan al final y se suben o bajan con las flechas.
 */
export default function ConstructorArticulo({ bloques, onChange, error }) {
    // Cada bloque lleva una clave propia para que al moverlos no se mezclen sus editores
    useEffect(() => {
        if (bloques.some((bloque) => !bloque._k)) onChange(bloques.map((bloque) => (bloque._k ? bloque : { ...bloque, _k: nuevaClave() })));
    }, [bloques, onChange]);

    const actualizar = (i, bloque) => onChange(bloques.map((actual, j) => (j === i ? bloque : actual)));
    const mover = (i, paso) => {
        const destino = i + paso;
        if (destino < 0 || destino >= bloques.length) return;
        const copia = [...bloques];
        [copia[i], copia[destino]] = [copia[destino], copia[i]];
        onChange(copia);
    };
    const quitar = (i) => onChange(bloques.filter((_, j) => j !== i));
    const agregar = (bloque) => onChange([...bloques, { ...bloque, _k: nuevaClave() }]);

    return (
        <div className="flex flex-col gap-4">
            {bloques.map((bloque, i) =>
                bloque.tipo === 'fotos' ? (
                    <Tarjeta key={bloque._k ?? i} titulo="Fotos" icono={ImagePlus} indice={i} total={bloques.length} onMover={(paso) => mover(i, paso)} onQuitar={() => quitar(i)}>
                        <EditorFotos bloque={bloque} onChange={(nuevo) => actualizar(i, nuevo)} />
                    </Tarjeta>
                ) : (
                    <Tarjeta key={bloque._k ?? i} titulo="Texto" icono={Type} indice={i} total={bloques.length} onMover={(paso) => mover(i, paso)} onQuitar={() => quitar(i)}>
                        <EditorRico conFotos={false} value={bloque.html} onChange={(html) => actualizar(i, { ...bloque, html })} />
                    </Tarjeta>
                ),
            )}

            <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => agregar(bloqueDeTexto())} className="inline-flex h-10 items-center gap-2 rounded-xl border border-dashed border-primary-300 bg-white px-4 text-sm font-semibold text-primary transition hover:bg-primary-50">
                    <Type className="size-4" aria-hidden="true" /> Agregar texto
                </button>
                <button type="button" onClick={() => agregar({ ...bloqueDeFotos([]), diseno: 'galeria', columnas: 3, proporcion: 'horizontal' })} className="inline-flex h-10 items-center gap-2 rounded-xl border border-dashed border-primary-300 bg-white px-4 text-sm font-semibold text-primary transition hover:bg-primary-50">
                    <ImagePlus className="size-4" aria-hidden="true" /> Agregar fotos
                </button>
            </div>
            {error && (
                <p className="text-sm font-medium text-red-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
