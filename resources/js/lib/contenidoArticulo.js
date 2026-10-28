// Contenido de los artículos del blog. Los nuevos se escriben con el editor del panel y se guardan como
// HTML (limpio en el servidor); los anteriores son texto simple y se siguen mostrando igual:
//   "## Título" · "- viñeta" · "![pie](dirección)" · varias imágenes seguidas = galería · línea en blanco = párrafo

const IMAGEN = /^!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^\s)]+)\)$/;

/** El pie de foto de ejemplo que ponía el editor antiguo no es un pie real. */
export const pieDe = (texto) => (texto === 'Pie de foto (opcional)' ? '' : texto);

/** ¿El contenido viene del editor (HTML) o es texto simple de un artículo anterior? */
export const esHtml = (contenido = '') => contenido.trimStart().startsWith('<');

const escapar = (texto) => texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Convierte el texto simple de un artículo anterior a HTML, para abrirlo en el editor. */
export function textoAHtml(texto = '') {
    return texto
        .replace(/\r\n/g, '\n')
        .split(/\n{2,}/)
        .map((bloque) => bloque.trim())
        .filter(Boolean)
        .map((bloque) => {
            const lineas = bloque.split('\n');
            let html = '';

            if (lineas[0].startsWith('## ')) html += `<h2>${escapar(lineas.shift().slice(3))}</h2>`;
            if (!lineas.length) return html;

            const imagenes = lineas.map((linea) => linea.match(IMAGEN));
            if (imagenes.every(Boolean)) {
                const fotos = imagenes.map(([, pie, direccion]) => `<img src="${escapar(direccion)}" alt="${escapar(pieDe(pie))}">`);
                return html + (fotos.length > 1 ? `<div class="galeria">${fotos.join('')}</div>` : fotos[0]);
            }

            if (lineas.every((linea) => linea.startsWith('- '))) {
                return html + `<ul>${lineas.map((linea) => `<li><p>${escapar(linea.slice(2))}</p></li>`).join('')}</ul>`;
            }

            return html + `<p>${lineas.map(escapar).join('<br>')}</p>`;
        })
        .join('');
}

export { IMAGEN };
