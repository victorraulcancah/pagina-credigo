import { useCallback, useEffect, useRef, useState } from 'react';
import api, { mensajeDeError } from '@/lib/api';

/**
 * Pide datos a la API REST (GET) y los vuelve a pedir cuando cambian los filtros.
 * `url` sin "/api" (ej. '/admin/banners'); `params`: filtros y página (?buscar=...&page=2).
 *
 * const { datos, respuesta, cargando, error, recargar } = useConsulta('/admin/solicitudes', { estado, page });
 *  - datos: `data` de la respuesta · respuesta: todo el cuerpo (pagination, conteos, opciones…)
 *  - cargando: true mientras pide (la primera vez `datos` es undefined)
 *  - recargar(): vuelve a pedir (después de guardar o eliminar)
 * Si llegan dos respuestas fuera de orden (filtros que cambian rápido), se queda con la última pedida.
 */
export function useConsulta(url, params = null) {
    const [respuesta, setRespuesta] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const ultimaPedida = useRef(0);
    const clave = JSON.stringify(params ?? {});

    const recargar = useCallback(async () => {
        const id = ++ultimaPedida.current;
        setCargando(true);

        try {
            const { data } = await api.get(url, { params: JSON.parse(clave) });
            if (id === ultimaPedida.current) {
                setRespuesta(data);
                setError(null);
            }
        } catch (e) {
            if (id === ultimaPedida.current) setError(mensajeDeError(e));
        } finally {
            if (id === ultimaPedida.current) setCargando(false);
        }
    }, [url, clave]);

    useEffect(() => {
        recargar();
    }, [recargar]);

    return { datos: respuesta?.data, respuesta, cargando, error, recargar };
}
