import axios from 'axios';

/**
 * Cliente de la API REST del sitio (/api). Respuesta estándar: { success, message, data[, pagination] }.
 * El panel usa la misma sesión del login (cookie de Sanctum + token XSRF): no se guardan tokens en el navegador.
 * Si la sesión venció (401/419), vuelve al login.
 */
const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

api.interceptors.response.use(
    (respuesta) => respuesta,
    (error) => {
        const estado = error.response?.status;
        if ((estado === 401 || estado === 419) && window.location.pathname.startsWith('/admin')) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

export default api;

/**
 * Datos de un formulario como FormData (para enviar archivos):
 * booleanos → "1"/"0", null → "", listas y objetos con claves anidadas (items[0][titulo]).
 */
export function aFormData(datos, formData = new FormData(), prefijo = '') {
    Object.entries(datos).forEach(([clave, valor]) => {
        const nombre = prefijo ? `${prefijo}[${clave}]` : clave;

        if (valor instanceof File || valor instanceof Blob) {
            formData.append(nombre, valor);
        } else if (Array.isArray(valor) || (valor && typeof valor === 'object')) {
            aFormData(valor, formData, nombre);
        } else if (typeof valor === 'boolean') {
            formData.append(nombre, valor ? '1' : '0');
        } else {
            formData.append(nombre, valor ?? '');
        }
    });

    return formData;
}

/** ¿Hay algún archivo entre los datos? (entonces se envía como FormData) */
export const tieneArchivos = (datos) =>
    Object.values(datos ?? {}).some((valor) => valor instanceof File || valor instanceof Blob || (Array.isArray(valor) && valor.some((v) => v instanceof File)));

/** Errores de validación de Laravel ({ campo: ['mensaje'] }) como { campo: 'mensaje' }. */
export const erroresDeValidacion = (error) =>
    Object.fromEntries(Object.entries(error.response?.data?.errors ?? {}).map(([campo, mensajes]) => [campo, Array.isArray(mensajes) ? mensajes[0] : mensajes]));

/** Mensaje para mostrar cuando algo falla (el de la API o uno general). */
export const mensajeDeError = (error) => {
    const estado = error.response?.status;
    if (estado === 429) return 'Hiciste varios intentos seguidos. Espera un minuto e inténtalo de nuevo.';
    if (estado && estado !== 500 && error.response.data?.message) return error.response.data.message;
    return 'No pudimos completar la operación. Revisa tu conexión e inténtalo de nuevo.';
};
