import { useMemo } from 'react';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import BloqueFotos from '@/components/web/BloqueFotos';
import TextoFormateado from '@/components/web/TextoFormateado';
import { esHtml, pieDe } from '@/lib/contenidoArticulo';
import { cn } from '@/lib/utils';

// Columnas de una galería según cuántas fotos tiene (clases completas para que Tailwind las detecte)
const COLUMNAS_GALERIA = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-2', 5: 'sm:grid-cols-3', 6: 'sm:grid-cols-3' };

/** Separa el HTML del editor en bloques: texto con formato, foto suelta o galería. */
function leerBloques(html) {
    const documento = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
    const foto = (img) => ({ src: img.getAttribute('src'), alt: pieDe(img.getAttribute('alt') ?? '') });

    return [...documento.body.children].map((nodo) => {
        const solaFoto = nodo.tagName === 'IMG' ? nodo : nodo.tagName === 'P' && nodo.children.length === 1 && nodo.firstElementChild.tagName === 'IMG' && !nodo.textContent.trim() ? nodo.firstElementChild : null;

        if (solaFoto) return { tipo: 'foto', ...foto(solaFoto) };
        if (nodo.tagName === 'DIV' && nodo.classList.contains('galeria')) return { tipo: 'galeria', fotos: [...nodo.querySelectorAll('img')].map(foto) };

        return { tipo: 'texto', html: nodo.outerHTML, parrafo: nodo.tagName === 'P' };
    });
}

/** Con `animar` el bloque aparece al bajar; si no, un div sin más. */
function Animado({ animar, children, ...props }) {
    return animar ? <Revelar {...props}>{children}</Revelar> : <div className={props.className}>{children}</div>;
}

function Pie({ texto }) {
    return texto ? <figcaption className="mt-2 text-center text-sm text-primary-700/70">{texto}</figcaption> : null;
}

/**
 * Contenido de un artículo del blog. El que escribe el editor del panel (HTML limpio) se muestra con su
 * formato —tamaños, colores, alineación, listas, enlaces— y cada bloque entra al bajar; las fotos con un
 * acercamiento y las galerías una foto tras otra. Los artículos anteriores (texto simple) se muestran igual que siempre.
 * `primerParrafo`: clases extra del primer párrafo (ej. letra capital).
 */
export default function ContenidoArticulo({ contenido = '', bloques: bloquesArticulo, className, primerParrafo, animar = false }) {
    const html = esHtml(contenido);
    const hayBloques = Boolean(bloquesArticulo?.length);
    const bloques = useMemo(() => (hayBloques ? bloquesArticulo.map((b) => (b.tipo === 'texto' ? { tipo: 'texto', html: b.html, parrafo: b.html.trimStart().startsWith('<p') } : b)) : html ? leerBloques(contenido) : []), [hayBloques, bloquesArticulo, html, contenido]);

    if (!hayBloques && !html) return <TextoFormateado texto={contenido} animar={animar} className={className} primerParrafo={primerParrafo} />;

    // El primer bloque de texto, si es un párrafo, lleva la letra capital
    const indicePrimerParrafo = bloques.findIndex((bloque) => bloque.tipo === 'texto');

    return (
        <div className={cn('contenido-rico flex flex-col gap-6', className)}>
            {bloques.map((bloque, i) => {
                if (bloque.tipo === 'foto') {
                    return (
                        <Animado key={i} animar={animar} desde="zoom" className="my-2">
                            <figure>
                                <img src={bloque.src} alt={bloque.alt} loading="lazy" />
                                <Pie texto={bloque.alt} />
                            </figure>
                        </Animado>
                    );
                }

                if (bloque.tipo === 'fotos') return <BloqueFotos key={i} bloque={bloque} animar={animar} />;

                if (bloque.tipo === 'galeria') {
                    return (
                        <div key={i} className={cn('galeria my-2 grid-cols-1', COLUMNAS_GALERIA[bloque.fotos.length] ?? 'sm:grid-cols-3')}>
                            {bloque.fotos.map((foto, j) => (
                                <Animado key={j} animar={animar} desde="zoom" retraso={escalonar(j, 120)} className="group">
                                    <figure>
                                        <div className="overflow-hidden rounded-[1.25rem]">
                                            <img src={foto.src} alt={foto.alt} loading="lazy" className="transition duration-500 ease-out group-hover:scale-105" />
                                        </div>
                                        <Pie texto={foto.alt} />
                                    </figure>
                                </Animado>
                            ))}
                        </div>
                    );
                }

                const conCapital = i === indicePrimerParrafo && bloque.parrafo;

                return animar ? (
                    <Revelar key={i} className={cn(conCapital && primerParrafo)} dangerouslySetInnerHTML={{ __html: bloque.html }} />
                ) : (
                    <div key={i} className={cn(conCapital && primerParrafo)} dangerouslySetInnerHTML={{ __html: bloque.html }} />
                );
            })}
        </div>
    );
}
