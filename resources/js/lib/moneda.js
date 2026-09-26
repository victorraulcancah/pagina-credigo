/** Monto con símbolo (S/ o US$) en formato peruano. Sin decimales si es entero. */
export function formatoMoneda(valor, moneda = 'PEN') {
    if (valor === null || valor === undefined || valor === '') return null;

    const numero = Number(valor);

    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: moneda,
        minimumFractionDigits: Number.isInteger(numero) ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(numero);
}

export const FRECUENCIAS = {
    semanal: { plural: 'semanales', periodo: 'por semana' },
    quincenal: { plural: 'quincenales', periodo: 'por quincena' },
    mensual: { plural: 'mensuales', periodo: 'por mes' },
};

/**
 * Resumen de una opción del cotizador. El total es solo inicial + cuota × n.º de
 * cuotas (monto referencial, sin intereses ni cargos): null si falta algún dato.
 */
export function resumenOpcion(opcion) {
    const frecuencia = FRECUENCIAS[opcion.frecuencia] ?? FRECUENCIAS.semanal;
    const tieneCuota = opcion.cuota !== null && opcion.cuota !== '' && opcion.cuota !== undefined;
    const tieneNumero = Boolean(opcion.numero_cuotas);
    const inicial = Number(opcion.inicial || 0);

    return {
        frecuencia,
        inicial: formatoMoneda(opcion.inicial, opcion.moneda),
        cuota: tieneCuota ? formatoMoneda(opcion.cuota, opcion.moneda) : null,
        numeroCuotas: tieneNumero ? Number(opcion.numero_cuotas) : null,
        total: tieneCuota && tieneNumero ? formatoMoneda(inicial + Number(opcion.cuota) * Number(opcion.numero_cuotas), opcion.moneda) : null,
    };
}
