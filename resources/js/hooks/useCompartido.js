import { useEffect, useState } from 'react';
import api from '@/lib/api';

/**
 * Datos de la API que usan varios componentes a la vez (el usuario conectado, el menú de planes,
 * los contadores del panel). Se piden una vez por visita y se reparten a todos; al cambiar de
 * página no se vuelven a pedir, salvo con `{ siempre: true }` (ej. los contadores del panel).
 */
const entradas = new Map(); // url → { datos, pidiendo, oyentes }

function entrada(url) {
    if (!entradas.has(url)) entradas.set(url, { datos: undefined, pidiendo: null, oyentes: new Set() });
    return entradas.get(url);
}

function avisar(e) {
    e.oyentes.forEach((oyente) => oyente(e.datos));
}

/** Vuelve a pedir los datos y actualiza a todos los que los usan (ej. tras leer una solicitud). */
export function refrescarCompartido(url) {
    const e = entrada(url);
    e.pidiendo = api
        .get(url)
        .then(({ data }) => {
            e.datos = data.data;
            avisar(e);
            return e.datos;
        })
        .catch(() => e.datos)
        .finally(() => {
            e.pidiendo = null;
        });
    return e.pidiendo;
}

/** Fija los datos sin pedirlos (ej. el usuario que devuelve el login). */
export function fijarCompartido(url, datos) {
    const e = entrada(url);
    e.datos = datos;
    avisar(e);
}

/** const sesion = useCompartido('/sesion'); → undefined mientras llega */
export function useCompartido(url, { siempre = false } = {}) {
    const e = entrada(url);
    const [datos, setDatos] = useState(e.datos);

    useEffect(() => {
        e.oyentes.add(setDatos);
        if (siempre || (e.datos === undefined && !e.pidiendo)) refrescarCompartido(url);
        else setDatos(e.datos);

        return () => e.oyentes.delete(setDatos);
    }, [url]);

    return datos;
}

/** Usuario conectado (o null): GET /api/sesion. */
export const useUsuario = () => useCompartido('/sesion')?.usuario ?? null;
