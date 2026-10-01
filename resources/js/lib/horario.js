// Días en el orden de Date.getDay() (0 = domingo), con las claves que usa el ERP
const CLAVES = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

/** Días de lunes a domingo para mostrar un horario completo. */
export const DIAS_SEMANA = [
    ['lunes', 'Lunes'],
    ['martes', 'Martes'],
    ['miercoles', 'Miércoles'],
    ['jueves', 'Jueves'],
    ['viernes', 'Viernes'],
    ['sabado', 'Sábado'],
    ['domingo', 'Domingo'],
];

const minutos = (hora) => {
    const [h, m] = String(hora).split(':').map(Number);
    return h * 60 + (m || 0);
};

/**
 * Estado del horario ahora mismo: { abierto, texto } o null si no hay horario.
 * horario = { lunes: { apertura: '08:00', cierre: '18:00', cerrado: false }, ... }
 */
export function estadoHorario(horario, ahora = new Date()) {
    const hoy = horario?.[CLAVES[ahora.getDay()]];
    if (!hoy) return null;
    if (hoy.cerrado || !hoy.apertura || !hoy.cierre) return { abierto: false, texto: 'Cerrado hoy' };

    const actual = ahora.getHours() * 60 + ahora.getMinutes();
    if (actual < minutos(hoy.apertura)) return { abierto: false, texto: `Cerrado · abre a las ${hoy.apertura}` };
    if (actual >= minutos(hoy.cierre)) return { abierto: false, texto: 'Cerrado ahora' };

    return { abierto: true, texto: `Abierto · cierra a las ${hoy.cierre}` };
}
