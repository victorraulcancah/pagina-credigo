import { cn } from '@/lib/utils';

// Una línea "![texto](https://...)" es una imagen (las inserta el editor del blog)
const IMAGEN = /^!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^\s)]+)\)$/;

/**
 * Muestra texto largo editado en el panel con un formato simple:
 * - "## Título" → subtítulo
 * - "- texto"   → viñeta
 * - "![texto](dirección)" en su propia línea → imagen (el texto va debajo, como pie de foto)
 * - línea en blanco → nuevo párrafo
 * `subtitulo`: etiqueta de los subtítulos (h3 si el texto va debajo de otro título h2).
 * `primerParrafo`: clases extra del primer párrafo (ej. letra capital en un artículo).
 */
export default function TextoFormateado({ texto = '', subtitulo: Subtitulo = 'h2', className, primerParrafo }) {
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
                        <Subtitulo key={`${i}-h`} className="mt-4 text-xl font-bold text-primary sm:text-2xl">
                            {lineas.shift().slice(3)}
                        </Subtitulo>,
                    );
                }

                if (!lineas.length) return elementos;

                const imagen = lineas.length === 1 && lineas[0].match(IMAGEN);

                if (imagen) {
                    elementos.push(
                        <figure key={`${i}-img`} className="my-4">
                            <img src={imagen[2]} alt={imagen[1]} loading="lazy" className="w-full rounded-[1.5rem] bg-primary-50 object-cover" />
                            {imagen[1] && <figcaption className="mt-2 text-center text-sm text-primary-700/70">{imagen[1]}</figcaption>}
                        </figure>,
                    );
                } else if (lineas.every((linea) => linea.startsWith('- '))) {
                    elementos.push(
                        <ul key={`${i}-ul`} className="ml-5 flex list-disc flex-col gap-2 marker:text-primary">
                            {lineas.map((linea, j) => (
                                <li key={j}>{linea.slice(2)}</li>
                            ))}
                        </ul>,
                    );
                } else {
                    elementos.push(
                        <p key={`${i}-p`} className={cn('whitespace-pre-line', !hayParrafo && primerParrafo)}>
                            {lineas.join('\n')}
                        </p>,
                    );
                    hayParrafo = true;
                }

                return elementos;
            })}
        </div>
    );
}
