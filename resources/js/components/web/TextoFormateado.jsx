import Revelar, { escalonar } from '@/components/ui/Revelar';
import { cn } from '@/lib/utils';

// Una línea "![texto](https://...)" es una imagen (las inserta el editor del blog)
const IMAGEN = /^!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^\s)]+)\)$/;

// El editor antiguo escribía este texto de ejemplo como pie de foto: no debe mostrarse
const pieDe = (texto) => (texto === 'Pie de foto (opcional)' ? '' : texto);

// Columnas de una galería (varias imágenes seguidas, una por línea) según cuántas son
const COLUMNAS_GALERIA = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-2', 5: 'sm:grid-cols-3', 6: 'sm:grid-cols-3' };

/** Cada bloque del texto: con `animar` aparece al bajar (Revelar); si no, la etiqueta tal cual. */
function Bloque({ animar, as: Tag, desde, ...props }) {
    return animar ? <Revelar as={Tag} desde={desde} {...props} /> : <Tag {...props} />;
}

/**
 * Muestra texto largo editado en el panel con un formato simple:
 * - "## Título" → subtítulo
 * - "- texto"   → viñeta
 * - "![texto](dirección)" en su propia línea → imagen (el texto va debajo, como pie de foto)
 * - varias líneas "![…](…)" seguidas, sin línea en blanco → galería (se acomodan en columnas)
 * - línea en blanco → nuevo párrafo
 * `subtitulo`: etiqueta de los subtítulos (h3 si el texto va debajo de otro título h2).
 * `primerParrafo`: clases extra del primer párrafo (ej. letra capital en un artículo).
 * `animar`: cada párrafo, subtítulo, lista e imagen aparece al bajar (las imágenes con un acercamiento).
 */
export default function TextoFormateado({ texto = '', subtitulo: Subtitulo = 'h2', className, primerParrafo, animar = false }) {
    const bloques = texto
        .replace(/\r\n/g, '\n')
        .split(/\n{2,}/)
        .map((bloque) => bloque.trim())
        .filter(Boolean);
    let hayParrafo = false;

    return (
        <div className={cn('flex flex-col gap-4 text-base leading-relaxed text-primary-700/90 sm:text-lg', className)}>
            {bloques.flatMap((bloque, i) => {
                const lineas = bloque.split('\n');
                const elementos = [];

                // Un subtítulo puede venir pegado al párrafo que lo sigue
                if (lineas[0].startsWith('## ')) {
                    elementos.push(
                        <Bloque key={`${i}-h`} animar={animar} as={Subtitulo} className="mt-4 text-xl font-bold text-primary sm:text-2xl">
                            {lineas.shift().slice(3)}
                        </Bloque>,
                    );
                }

                if (!lineas.length) return elementos;

                const imagenes = lineas.map((linea) => linea.match(IMAGEN));
                const soloImagenes = imagenes.every(Boolean);

                if (soloImagenes && imagenes.length === 1) {
                    const [, texto, direccion] = imagenes[0];

                    elementos.push(
                        <Bloque key={`${i}-img`} animar={animar} as="figure" desde="zoom" className="my-4">
                            <img src={direccion} alt={pieDe(texto)} loading="lazy" className="w-full rounded-[1.5rem] bg-primary-50 object-cover" />
                            {pieDe(texto) && <figcaption className="mt-2 text-center text-sm text-primary-700/70">{pieDe(texto)}</figcaption>}
                        </Bloque>,
                    );
                } else if (soloImagenes) {
                    // Galería: cada foto entra con su acercamiento, una tras otra, y se agranda un poco al pasar el mouse
                    elementos.push(
                        <div key={`${i}-gal`} className={cn('my-4 grid gap-3 sm:gap-4', COLUMNAS_GALERIA[imagenes.length] ?? 'sm:grid-cols-3')}>
                            {imagenes.map(([, texto, direccion], j) => (
                                <Bloque key={j} animar={animar} as="figure" desde="zoom" retraso={escalonar(j, 120)} className="group">
                                    <div className="overflow-hidden rounded-[1.25rem] bg-primary-50">
                                        <img
                                            src={direccion}
                                            alt={pieDe(texto)}
                                            loading="lazy"
                                            className="aspect-[4/3] w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                                        />
                                    </div>
                                    {pieDe(texto) && <figcaption className="mt-2 text-center text-sm text-primary-700/70">{pieDe(texto)}</figcaption>}
                                </Bloque>
                            ))}
                        </div>,
                    );
                } else if (lineas.every((linea) => linea.startsWith('- '))) {
                    elementos.push(
                        <Bloque key={`${i}-ul`} animar={animar} as="ul" className="ml-5 flex list-disc flex-col gap-2 marker:text-primary">
                            {lineas.map((linea, j) => (
                                <li key={j}>{linea.slice(2)}</li>
                            ))}
                        </Bloque>,
                    );
                } else {
                    elementos.push(
                        <Bloque key={`${i}-p`} animar={animar} as="p" className={cn('whitespace-pre-line', !hayParrafo && primerParrafo)}>
                            {lineas.join('\n')}
                        </Bloque>,
                    );
                    hayParrafo = true;
                }

                return elementos;
            })}
        </div>
    );
}
