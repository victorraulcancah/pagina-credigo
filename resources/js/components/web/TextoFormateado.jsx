import { cn } from '@/lib/utils';

/**
 * Muestra texto largo editado en el panel con un formato simple:
 * - "## Título" → subtítulo
 * - "- texto"   → viñeta
 * - línea en blanco → nuevo párrafo
 * `subtitulo`: etiqueta de los subtítulos (h3 si el texto va debajo de otro título h2).
 */
export default function TextoFormateado({ texto = '', subtitulo: Subtitulo = 'h2', className }) {
    const bloques = texto
        .replace(/\r\n/g, '\n')
        .split(/\n{2,}/)
        .map((bloque) => bloque.trim())
        .filter(Boolean);

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

                if (lineas.every((linea) => linea.startsWith('- '))) {
                    elementos.push(
                        <ul key={`${i}-ul`} className="ml-5 flex list-disc flex-col gap-2 marker:text-primary">
                            {lineas.map((linea, j) => (
                                <li key={j}>{linea.slice(2)}</li>
                            ))}
                        </ul>,
                    );
                } else {
                    elementos.push(
                        <p key={`${i}-p`} className="whitespace-pre-line">
                            {lineas.join('\n')}
                        </p>,
                    );
                }

                return elementos;
            })}
        </div>
    );
}
