import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { Color, FontSize, TextStyle } from '@tiptap/extension-text-style';
import { EditorContent, Node, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Highlighter,
    ImagePlus,
    Italic,
    Link2,
    List,
    ListOrdered,
    Palette,
    Quote,
    Redo2,
    Strikethrough,
    Trash2,
    Underline as UnderlineIcon,
    Undo2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import api, { erroresDeValidacion, mensajeDeError } from '@/lib/api';
import { esHtml, textoAHtml } from '@/lib/contenidoArticulo';
import { cn } from '@/lib/utils';
import { errorAlert } from '@/utils/sweetalert';

const MAX_FOTOS_A_LA_VEZ = 6; // las que forman una galería

const COLORES_TEXTO = ['#0f1037', '#000000', '#4b5563', '#dc2626', '#ea580c', '#16a34a', '#2563eb', '#7c3aed', '#db2777', '#ffffff'];
const COLORES_RESALTADO = ['#f8ec34', '#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa', '#e9d5ff'];

// em (y no rem) porque es lo que acepta el limpiador de HTML del servidor
const TAMANOS = [
    { value: '', label: 'Tamaño normal' },
    { value: '0.875em', label: 'Pequeño' },
    { value: '1.25em', label: 'Grande' },
    { value: '1.5em', label: 'Muy grande' },
];

const ESTILOS = [
    { value: 'p', label: 'Texto normal' },
    { value: 'h2', label: 'Título' },
    { value: 'h3', label: 'Subtítulo' },
    { value: 'h4', label: 'Subtítulo pequeño' },
];

/** Varias fotos seguidas (el grupo de fotos que en la web es una galería). */
const Galeria = Node.create({
    name: 'galeria',
    group: 'block',
    content: 'image+',
    parseHTML: () => [{ tag: 'div.galeria' }],
    renderHTML: () => ['div', { class: 'galeria' }, 0],
});

const boton = (activo) =>
    cn(
        'flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-700 transition hover:bg-white hover:text-primary disabled:opacity-30',
        activo && 'bg-white text-primary shadow-sm ring-1 ring-gray-200',
    );

const selector = 'h-8 cursor-pointer rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-700 focus:outline-none';

function Separador() {
    return <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-gray-300" />;
}

/** Botón que abre un panelito debajo (paleta de colores, dirección del enlace); se cierra al hacer clic fuera. */
function Desplegable({ etiqueta, icono: Icono, activo, indicador, children }) {
    const [abierto, setAbierto] = useState(false);
    const caja = useRef(null);

    useEffect(() => {
        if (!abierto) return;
        const cerrar = (e) => !caja.current?.contains(e.target) && setAbierto(false);
        document.addEventListener('mousedown', cerrar);
        return () => document.removeEventListener('mousedown', cerrar);
    }, [abierto]);

    return (
        <div ref={caja} className="relative">
            <button type="button" aria-label={etiqueta} title={etiqueta} aria-expanded={abierto} onClick={() => setAbierto(!abierto)} className={cn(boton(activo), 'relative')}>
                <Icono className="size-4" aria-hidden="true" />
                {indicador && <span aria-hidden="true" className="absolute right-1 bottom-1 left-1 h-0.5 rounded-full ring-1 ring-black/10" style={{ background: indicador }} />}
            </button>
            {abierto && (
                <div className="absolute top-full left-0 z-20 mt-1 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                    {typeof children === 'function' ? children(() => setAbierto(false)) : children}
                </div>
            )}
        </div>
    );
}

function Paleta({ colores, actual, onElegir, onQuitar, textoQuitar }) {
    return (
        <div className="w-44">
            <div className="grid grid-cols-5 gap-2">
                {colores.map((color) => (
                    <button
                        key={color}
                        type="button"
                        aria-label={`Color ${color}`}
                        onClick={() => onElegir(color)}
                        className={cn('size-6 rounded-full ring-1 ring-black/15 transition hover:scale-110', actual === color && 'ring-2 ring-primary')}
                        style={{ background: color }}
                    />
                ))}
            </div>
            <label className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                Otro color
                <input type="color" value={actual?.startsWith('#') && actual.length === 7 ? actual : '#000000'} onChange={(e) => onElegir(e.target.value)} className="h-6 w-10 cursor-pointer rounded border border-gray-200 bg-white" />
            </label>
            <button type="button" onClick={onQuitar} className="mt-3 w-full rounded-lg bg-gray-100 px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200">
                {textoQuitar}
            </button>
        </div>
    );
}

function PanelEnlace({ editor, cerrar }) {
    const [direccion, setDireccion] = useState(editor.getAttributes('link').href ?? '');

    const aplicar = (e) => {
        e.preventDefault();
        const limpia = direccion.trim();
        if (!limpia) return quitar();
        const conEsquema = /^(https?:\/\/|mailto:|tel:)/i.test(limpia) ? limpia : `https://${limpia}`;
        editor.chain().focus().extendMarkRange('link').setLink({ href: conEsquema }).run();
        cerrar();
    };

    const quitar = () => {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        cerrar();
    };

    return (
        <form onSubmit={aplicar} className="flex w-72 flex-col gap-2">
            <label className="text-xs font-medium text-gray-600" htmlFor="direccion-enlace">
                Dirección del enlace (selecciona antes el texto)
            </label>
            <input
                id="direccion-enlace"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="https://..."
                className="h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-primary focus:outline-none"
            />
            <div className="flex gap-2">
                <button type="submit" className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white">
                    Aplicar
                </button>
                {editor.isActive('link') && (
                    <button type="button" onClick={quitar} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200">
                        Quitar
                    </button>
                )}
            </div>
        </form>
    );
}

/** Pie de foto de la foto elegida (o quitarla). Aparece solo cuando hay una foto seleccionada. */
function BarraImagen({ editor, pie }) {
    return (
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-accent/20 px-3 py-2 text-sm">
            <label htmlFor="pie-de-foto" className="font-medium text-primary">
                Pie de foto
            </label>
            <input
                id="pie-de-foto"
                value={pie}
                onChange={(e) => editor.chain().updateAttributes('image', { alt: e.target.value }).run()}
                placeholder="Opcional: se muestra debajo de la foto"
                className="h-8 min-w-48 flex-1 rounded-lg border border-gray-200 bg-white px-3 focus:border-primary focus:outline-none"
            />
            <button type="button" onClick={() => editor.chain().focus().deleteSelection().run()} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 font-medium text-red-600 ring-1 ring-gray-200 hover:bg-red-50">
                <Trash2 className="size-4" aria-hidden="true" /> Quitar foto
            </button>
        </div>
    );
}

function Barra({ editor }) {
    const archivo = useRef(null);
    const [subiendo, setSubiendo] = useState(false);

    const estado = useEditorState({
        editor,
        selector: ({ editor: e }) => ({
            estilo: e.isActive('heading', { level: 2 }) ? 'h2' : e.isActive('heading', { level: 3 }) ? 'h3' : e.isActive('heading', { level: 4 }) ? 'h4' : 'p',
            tamano: e.getAttributes('textStyle').fontSize ?? '',
            color: e.getAttributes('textStyle').color ?? null,
            resaltado: e.getAttributes('highlight').color ?? null,
            negrita: e.isActive('bold'),
            cursiva: e.isActive('italic'),
            subrayado: e.isActive('underline'),
            tachado: e.isActive('strike'),
            izquierda: e.isActive({ textAlign: 'left' }),
            centro: e.isActive({ textAlign: 'center' }),
            derecha: e.isActive({ textAlign: 'right' }),
            justificado: e.isActive({ textAlign: 'justify' }),
            vinetas: e.isActive('bulletList'),
            numerada: e.isActive('orderedList'),
            cita: e.isActive('blockquote'),
            enlace: e.isActive('link'),
            imagen: e.isActive('image'),
            pie: e.getAttributes('image').alt ?? '',
            deshacer: e.can().undo(),
            rehacer: e.can().redo(),
        }),
    });

    const cambiarEstilo = (valor) => {
        const cadena = editor.chain().focus();
        if (valor === 'p') cadena.setParagraph().run();
        else cadena.setHeading({ level: Number(valor.slice(1)) }).run();
    };

    const cambiarTamano = (valor) => {
        const cadena = editor.chain().focus();
        if (valor) cadena.setFontSize(valor).run();
        else cadena.unsetFontSize().run();
    };

    // Con varias fotos a la vez, juntas forman una galería en la web
    const subirImagenes = async (e) => {
        const imagenes = Array.from(e.target.files ?? []).slice(0, MAX_FOTOS_A_LA_VEZ);
        e.target.value = '';
        if (!imagenes.length) return;

        setSubiendo(true);
        const direcciones = [];
        try {
            for (const imagen of imagenes) {
                const datos = new FormData();
                datos.append('imagen', imagen);
                const respuesta = await api.post('/admin/articulos/imagenes', datos);
                direcciones.push(respuesta.data.data.url);
            }
        } catch (err) {
            errorAlert('No se pudo subir la imagen', Object.values(erroresDeValidacion(err))[0] ?? mensajeDeError(err));
        } finally {
            const fotos = direcciones.map((src) => ({ type: 'image', attrs: { src, alt: '' } }));
            if (fotos.length === 1) editor.chain().focus().insertContent(fotos[0]).run();
            else if (fotos.length > 1) editor.chain().focus().insertContent({ type: 'galeria', content: fotos }).run();
            setSubiendo(false);
        }
    };

    const alinear = (valor) => editor.chain().focus().setTextAlign(valor).run();

    return (
        <>
            <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-1.5">
                <button type="button" aria-label="Deshacer" title="Deshacer" disabled={!estado.deshacer} onClick={() => editor.chain().focus().undo().run()} className={boton(false)}>
                    <Undo2 className="size-4" aria-hidden="true" />
                </button>
                <button type="button" aria-label="Rehacer" title="Rehacer" disabled={!estado.rehacer} onClick={() => editor.chain().focus().redo().run()} className={boton(false)}>
                    <Redo2 className="size-4" aria-hidden="true" />
                </button>
                <Separador />
                <select aria-label="Estilo del párrafo" value={estado.estilo} onChange={(e) => cambiarEstilo(e.target.value)} className={selector}>
                    {ESTILOS.map((estilo) => (
                        <option key={estilo.value} value={estilo.value}>
                            {estilo.label}
                        </option>
                    ))}
                </select>
                <select aria-label="Tamaño de letra" value={estado.tamano} onChange={(e) => cambiarTamano(e.target.value)} className={selector}>
                    {TAMANOS.map((tamano) => (
                        <option key={tamano.value} value={tamano.value}>
                            {tamano.label}
                        </option>
                    ))}
                </select>
                <Separador />
                <button type="button" aria-label="Negrita" title="Negrita" onClick={() => editor.chain().focus().toggleBold().run()} className={boton(estado.negrita)}>
                    <Bold className="size-4" aria-hidden="true" />
                </button>
                <button type="button" aria-label="Cursiva" title="Cursiva" onClick={() => editor.chain().focus().toggleItalic().run()} className={boton(estado.cursiva)}>
                    <Italic className="size-4" aria-hidden="true" />
                </button>
                <button type="button" aria-label="Subrayado" title="Subrayado" onClick={() => editor.chain().focus().toggleUnderline().run()} className={boton(estado.subrayado)}>
                    <UnderlineIcon className="size-4" aria-hidden="true" />
                </button>
                <button type="button" aria-label="Tachado" title="Tachado" onClick={() => editor.chain().focus().toggleStrike().run()} className={boton(estado.tachado)}>
                    <Strikethrough className="size-4" aria-hidden="true" />
                </button>
                <Desplegable etiqueta="Color del texto" icono={Palette} indicador={estado.color}>
                    {(cerrar) => (
                        <Paleta
                            colores={COLORES_TEXTO}
                            actual={estado.color}
                            onElegir={(color) => editor.chain().focus().setColor(color).run()}
                            onQuitar={() => {
                                editor.chain().focus().unsetColor().run();
                                cerrar();
                            }}
                            textoQuitar="Color normal"
                        />
                    )}
                </Desplegable>
                <Desplegable etiqueta="Resaltar texto" icono={Highlighter} indicador={estado.resaltado}>
                    {(cerrar) => (
                        <Paleta
                            colores={COLORES_RESALTADO}
                            actual={estado.resaltado}
                            onElegir={(color) => editor.chain().focus().setHighlight({ color }).run()}
                            onQuitar={() => {
                                editor.chain().focus().unsetHighlight().run();
                                cerrar();
                            }}
                            textoQuitar="Sin resaltado"
                        />
                    )}
                </Desplegable>
                <Separador />
                <button type="button" aria-label="Alinear a la izquierda" title="Alinear a la izquierda" onClick={() => alinear('left')} className={boton(estado.izquierda)}>
                    <AlignLeft className="size-4" aria-hidden="true" />
                </button>
                <button type="button" aria-label="Centrar" title="Centrar" onClick={() => alinear('center')} className={boton(estado.centro)}>
                    <AlignCenter className="size-4" aria-hidden="true" />
                </button>
                <button type="button" aria-label="Alinear a la derecha" title="Alinear a la derecha" onClick={() => alinear('right')} className={boton(estado.derecha)}>
                    <AlignRight className="size-4" aria-hidden="true" />
                </button>
                <button type="button" aria-label="Justificar" title="Justificar" onClick={() => alinear('justify')} className={boton(estado.justificado)}>
                    <AlignJustify className="size-4" aria-hidden="true" />
                </button>
                <Separador />
                <button type="button" aria-label="Lista con vinetas" title="Lista con vinetas" onClick={() => editor.chain().focus().toggleBulletList().run()} className={boton(estado.vinetas)}>
                    <List className="size-4" aria-hidden="true" />
                </button>
                <button type="button" aria-label="Lista numerada" title="Lista numerada" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={boton(estado.numerada)}>
                    <ListOrdered className="size-4" aria-hidden="true" />
                </button>
                <button type="button" aria-label="Cita" title="Cita" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={boton(estado.cita)}>
                    <Quote className="size-4" aria-hidden="true" />
                </button>
                <Desplegable etiqueta="Enlace" icono={Link2} activo={estado.enlace}>
                    {(cerrar) => <PanelEnlace editor={editor} cerrar={cerrar} />}
                </Desplegable>
                <Separador />
                <button
                    type="button"
                    title={`Subir fotos (hasta ${MAX_FOTOS_A_LA_VEZ} a la vez; varias juntas forman una galería)`}
                    onClick={() => archivo.current?.click()}
                    disabled={subiendo}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-gray-700 transition hover:bg-white hover:text-primary disabled:opacity-50"
                >
                    <ImagePlus className="size-4" aria-hidden="true" /> {subiendo ? 'Subiendo...' : 'Fotos'}
                </button>
                <input ref={archivo} type="file" multiple accept="image/png,image/jpeg,image/webp" className="hidden" onChange={subirImagenes} />
            </div>
            {estado.imagen && <BarraImagen editor={editor} pie={estado.pie} />}
        </>
    );
}

/**
 * Editor de texto del blog, como un procesador de texto: estilos, tamaños, colores, alineación, listas,
 * enlaces y fotos (varias juntas = galería). Guarda HTML, que el servidor limpia antes de guardarlo.
 * Un artículo anterior (texto simple) se convierte a HTML al abrirlo.
 */
export default function EditorRico({ value, onChange, error }) {
    const ultimo = useRef(value); // lo último que emitió el editor: así no se vuelve a cargar lo que él mismo escribió

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3, 4] },
                code: false,
                codeBlock: false,
                link: { openOnClick: false, autolink: true, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } },
            }),
            TextStyle,
            Color,
            FontSize,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Image.configure({ allowBase64: false }),
            Galeria,
            Placeholder.configure({ placeholder: 'Escribe el artículo aquí. Usa la barra de arriba para dar formato y subir fotos.' }),
        ],
        content: esHtml(value) ? value : textoAHtml(value),
        editorProps: {
            attributes: { id: 'contenido', class: 'contenido-rico', 'aria-label': 'Contenido del artículo' },
        },
        onUpdate: ({ editor: e }) => {
            const html = e.isEmpty ? '' : e.getHTML();
            ultimo.current = html;
            onChange(html);
        },
    });

    // Si el contenido cambia desde fuera (otro artículo), se carga en el editor
    useEffect(() => {
        if (editor && value !== ultimo.current) {
            ultimo.current = value;
            editor.commands.setContent(esHtml(value) ? value : textoAHtml(value), { emitUpdate: false });
        }
    }, [value, editor]);

    if (!editor) return null;

    return (
        <div className={cn('editor-rico overflow-hidden rounded-xl border bg-white', error ? 'border-red-500' : 'border-primary-200 focus-within:border-primary')}>
            <Barra editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
