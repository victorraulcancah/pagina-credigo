import { useState } from 'react';
import { useConsulta } from '@/hooks/useConsulta';

/** Filtros guardados en la dirección (?estado=nuevo&page=2): así se pueden compartir y sobreviven a recargar. */
function leerDeUrl(claves) {
    const query = new URLSearchParams(window.location.search);
    return Object.fromEntries(claves.filter((clave) => query.has(clave)).map((clave) => [clave, clave === 'page' ? Number(query.get(clave)) || 1 : query.get(clave)]));
}

function escribirEnUrl(filtros, porDefecto) {
    const query = new URLSearchParams(Object.entries(filtros).filter(([clave, valor]) => valor !== '' && valor !== porDefecto[clave]));
    const texto = query.toString();
    // Conserva el estado de Inertia en el historial; solo cambia la dirección visible
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${texto ? `?${texto}` : ''}`);
}

/**
 * Lista paginada del panel con filtros, pedida a la API (como las bandejas de solicitudes y reclamaciones).
 *
 * const lista = useListaFiltrada('/admin/solicitudes', { buscar: '', estado: 'todos', page: 1 });
 * lista.filtros · lista.filtrar({ estado: 'nuevo' }) (vuelve a la página 1) · lista.filtrar({ page: 2 })
 * lista.respuesta → { data, pagination, conteos, opciones… } · lista.recargar()
 */
export function useListaFiltrada(url, porDefecto) {
    const [filtros, setFiltros] = useState(() => ({ ...porDefecto, ...leerDeUrl(Object.keys(porDefecto)) }));
    const consulta = useConsulta(url, filtros);

    const filtrar = (cambios) => {
        const nuevos = { ...filtros, ...cambios, page: cambios.page ?? 1 };
        setFiltros(nuevos);
        escribirEnUrl(nuevos, porDefecto);
    };

    return { ...consulta, filtros, filtrar };
}
