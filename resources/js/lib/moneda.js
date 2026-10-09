// En es-PE el navegador escribe los dólares como "USD": aquí se usa US$, como en el resto del sitio
const SIMBOLOS = { PEN: 'S/', USD: 'US$' };

/** Monto con símbolo (S/ o US$) en formato peruano. Sin decimales si es entero. */
export function formatoMoneda(valor, moneda = 'PEN') {
    if (valor === null || valor === undefined || valor === '') return null;

    const numero = Number(valor);
    const cifra = new Intl.NumberFormat('es-PE', {
        minimumFractionDigits: Number.isInteger(numero) ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(numero);

    // Espacio que no se corta: el símbolo nunca queda en otra línea que la cifra
    return `${SIMBOLOS[moneda] ?? moneda} ${cifra}`;
}

export const FRECUENCIAS = {
    semanal: { plural: 'semanales', periodo: 'por semana' },
    quincenal: { plural: 'quincenales', periodo: 'por quincena' },
    mensual: { plural: 'mensuales', periodo: 'por mes' },
};

/** Moneda de la inicial: la suya propia o, si no la trae, la de la cuota. */
export const monedaInicial = (opcion) => opcion.moneda_inicial || opcion.moneda;

/**
 * Resumen de una opción del cotizador. El total es solo inicial + cuota × n.º de
 * cuotas (monto referencial, sin intereses ni cargos): null si falta algún dato.
 * Si la inicial va en otra moneda que las cuotas, no se suman (no hay tipo de
 * cambio): el total muestra las dos partes, ej. "US$ 2,500 + S/ 70,300".
 */
export function resumenOpcion(opcion) {
    const frecuencia = FRECUENCIAS[opcion.frecuencia] ?? FRECUENCIAS.semanal;
    const tieneCuota = opcion.cuota !== null && opcion.cuota !== '' && opcion.cuota !== undefined;
    const tieneNumero = Boolean(opcion.numero_cuotas);
    const inicial = Number(opcion.inicial || 0);
    const totalCuotas = Number(opcion.cuota) * Number(opcion.numero_cuotas);
    const otraMoneda = inicial > 0 && monedaInicial(opcion) !== opcion.moneda;

    let total = null;
    if (tieneCuota && tieneNumero) {
        total = otraMoneda
            ? `${formatoMoneda(inicial, monedaInicial(opcion))} + ${formatoMoneda(totalCuotas, opcion.moneda)}`
            : formatoMoneda(inicial + totalCuotas, opcion.moneda);
    }

    return {
        frecuencia,
        inicial: formatoMoneda(opcion.inicial, monedaInicial(opcion)),
        cuota: tieneCuota ? formatoMoneda(opcion.cuota, opcion.moneda) : null,
        numeroCuotas: tieneNumero ? Number(opcion.numero_cuotas) : null,
        total,
        otraMoneda, // la inicial va en otra moneda que las cuotas
    };
}

/** Opción con la cuota más baja (prefiere soles); null si ninguna tiene monto cargado. */
export function cuotaMasBaja(opciones = []) {
    const conCuota = opciones.filter((o) => o.cuota !== null && o.cuota !== undefined);
    if (!conCuota.length) return null;
    const soles = conCuota.filter((o) => o.moneda === 'PEN');
    const lista = soles.length ? soles : conCuota;
    return lista.reduce((menor, o) => (Number(o.cuota) < Number(menor.cuota) ? o : menor));
}
