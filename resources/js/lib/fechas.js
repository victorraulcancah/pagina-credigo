/** Fecha legible en español de Perú (ej. "26 set 2026, 3:45 p. m."). */
export function formatoFecha(valor, conHora = true) {
    if (!valor) return '';

    return new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'medium',
        ...(conHora && { timeStyle: 'short' }),
    }).format(new Date(valor));
}
