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

/** Un bloque de fotos con las opciones por defecto (las mismas que pone el servidor). */
export const bloqueDeFotos = (fotos) => ({
    tipo: 'fotos',
    fotos,
    diseno: fotos.length > 1 ? 'galeria' : 'unica',
    columnas: fotos.length === 4 ? 2 : Math.min(Math.max(fotos.length, 2), 3),
    tamano: 'grande',
    alineacion: 'centro',
    proporcion: fotos.length > 1 ? 'horizontal' : 'original',
    animacion: 'zoom',
});

export const bloqueDeTexto = (html = '') => ({ tipo: 'texto', html });

/**
 * Convierte el contenido de un artículo anterior (texto simple o HTML con fotos dentro) en bloques en orden:
 * el texto seguido forma un bloque de texto y cada foto suelta o galería, un bloque de fotos.
 */
export function contenidoABloques(contenido = '') {
    const html = esHtml(contenido) ? contenido : textoAHtml(contenido);
    const documento = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
    const bloques = [];
    let texto = '';
    const volcarTexto = () => {
        if (texto) bloques.push(bloqueDeTexto(texto));
        texto = '';
    };
    const foto = (img) => ({ src: img.getAttribute('src'), alt: pieDe(img.getAttribute('alt') ?? '') });

    for (const nodo of documento.body.children) {
        const solaFoto = nodo.tagName === 'IMG' ? nodo : nodo.tagName === 'P' && nodo.children.length === 1 && nodo.firstElementChild.tagName === 'IMG' && !nodo.textContent.trim() ? nodo.firstElementChild : null;

        if (solaFoto) {
            volcarTexto();
            bloques.push(bloqueDeFotos([foto(solaFoto)]));
        } else if (nodo.tagName === 'DIV' && nodo.classList.contains('galeria')) {
            volcarTexto();
            const fotos = [...nodo.querySelectorAll('img')].map(foto);
            if (fotos.length) bloques.push(bloqueDeFotos(fotos));
        } else {
            texto += nodo.outerHTML;
        }
    }
    volcarTexto();

    return bloques.length ? bloques : [bloqueDeTexto()];
}

export { IMAGEN };
