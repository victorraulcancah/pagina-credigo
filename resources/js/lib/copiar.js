/**
 * Copia texto al portapapeles. El API moderno solo existe en https/localhost;
 * en http se usa el método antiguo con un textarea temporal.
 */
export async function copiarTexto(texto) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(texto);
        return true;
    }

    const area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const copiado = document.execCommand('copy');
    area.remove();

    return copiado;
}
