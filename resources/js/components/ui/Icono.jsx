import { iconos } from '@/lib/iconos';

/** Renderiza un ícono por su nombre guardado en la BD (ej. "Car"). */
export default function Icono({ nombre, fallback = 'Sparkles', ...props }) {
    const Componente = iconos[nombre] ?? (fallback ? iconos[fallback] : null);

    return Componente ? <Componente aria-hidden="true" {...props} /> : null;
}
