import { cn } from '@/lib/utils';

const porcentaje = (valor) => `${Number.isInteger(valor) ? valor : String(valor).replace('.', ',')} %`;

/** "Con 3 financiamientos terminados" · "Nivel de ingreso" (0) · nada si el nivel no viene del ERP. */
export function textoFinanciamientos(nivel) {
    if (nivel.financiamientos == null) return null;
    if (nivel.financiamientos === 0) return 'Nivel de ingreso';

    return `Con ${nivel.financiamientos} financiamiento${nivel.financiamientos === 1 ? '' : 's'} terminado${nivel.financiamientos === 1 ? '' : 's'}`;
}

/**
 * Los números de un nivel que vienen del ERP: financiamientos que pide y % de inicial en talleres y celulares.
 * `claro`: sobre una tarjeta oscura. Sin datos del ERP no muestra nada.
 */
export default function DatosNivel({ nivel, claro = false, className }) {
    const financiamientos = textoFinanciamientos(nivel);
    const { taller, celular } = nivel.porcentajes ?? {};
    const inicial = [taller != null && `${porcentaje(taller)} en talleres`, celular != null && `${porcentaje(celular)} en celulares`].filter(Boolean);

    if (!financiamientos && !inicial.length) return null;

    return (
        <ul className={cn('flex flex-col gap-1 text-sm font-semibold', claro ? 'text-accent' : 'text-primary', className)}>
            {financiamientos && <li>{financiamientos}</li>}
            {inicial.length > 0 && <li className={claro ? 'text-white/80' : 'text-primary-600'}>Inicial: {inicial.join(' · ')}</li>}
        </ul>
    );
}
