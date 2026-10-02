import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import api, { aFormData, erroresDeValidacion, mensajeDeError, tieneArchivos } from '@/lib/api';
import { errorAlert, toast } from '@/utils/sweetalert';

/**
 * Formulario que guarda por la API REST (/api). Se usa como useForm de Inertia:
 * data, setData, errors, processing, isDirty, reset, setDefaults, clearErrors, recentlySuccessful.
 *
 * form.post(url) · form.put(url) · form.patch(url) · form.delete(url) → { success, data, errors }
 * Opciones: { recargar = true, avisar = true, onSuccess(respuesta), datos }
 *  - Con archivos envía FormData (PUT/PATCH van como POST + _method, porque PHP no lee archivos en PUT).
 *  - Si sale bien muestra el mensaje de la API y recarga los datos de la página (Inertia).
 *  - Errores de validación (422) quedan en `errors`; otros errores se avisan con una alerta.
 */
export function useFormApi(inicial = {}) {
    const [data, setDataEstado] = useState(inicial);
    const [defaults, setDefaultsEstado] = useState(inicial);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);
    const [progress, setProgress] = useState(null); // { percentage } mientras se suben archivos
    const temporizador = useRef(null);

    /** setData('campo', valor) · setData({ ...todo }) · setData((actual) => nuevo) */
    const setData = (clave, valor) => {
        if (typeof clave === 'string') setDataEstado((actual) => ({ ...actual, [clave]: valor }));
        else setDataEstado(clave);
    };

    /** Sin argumentos: los valores actuales pasan a ser los "guardados" (isDirty vuelve a false). */
    const setDefaults = (nuevos) => setDefaultsEstado(nuevos ?? data);

    /** Vuelve a los valores guardados (todos o solo los campos indicados). */
    const reset = (...campos) =>
        setDataEstado((actual) => (campos.length ? { ...actual, ...Object.fromEntries(campos.map((c) => [c, defaults[c]])) } : defaults));

    const clearErrors = (...campos) =>
        setErrors((actuales) => (campos.length ? Object.fromEntries(Object.entries(actuales).filter(([c]) => !campos.includes(c))) : {}));

    const enviar = async (metodo, url, { recargar = true, avisar = true, onSuccess, datos } = {}) => {
        const cuerpo = datos ?? data;
        setProcessing(true);
        setErrors({});

        try {
            let respuesta;
            if (metodo === 'delete') {
                respuesta = await api.delete(url);
            } else if (tieneArchivos(cuerpo)) {
                const formData = aFormData(cuerpo);
                if (metodo !== 'post') formData.append('_method', metodo.toUpperCase());
                respuesta = await api.post(url, formData, {
                    onUploadProgress: (e) => e.total && setProgress({ percentage: Math.round((e.loaded * 100) / e.total) }),
                });
            } else {
                respuesta = await api[metodo](url, cuerpo);
            }

            if (avisar && respuesta.data?.message) toast(respuesta.data.message);
            setRecentlySuccessful(true);
            clearTimeout(temporizador.current);
            temporizador.current = setTimeout(() => setRecentlySuccessful(false), 2000);

            onSuccess?.(respuesta.data);
            if (recargar) router.reload({ preserveScroll: true });

            return { success: true, data: respuesta.data?.data, message: respuesta.data?.message };
        } catch (error) {
            // Errores por campo (validación, o "no encontrado" de una consulta): junto a cada campo
            if (error.response?.data?.errors) {
                const errores = erroresDeValidacion(error);
                setErrors(errores);
                return { success: false, errors: errores };
            }
            errorAlert('No se pudo completar', mensajeDeError(error));
            return { success: false, message: mensajeDeError(error) };
        } finally {
            setProcessing(false);
            setProgress(null);
        }
    };

    return {
        data,
        setData,
        errors,
        setErrors,
        clearErrors,
        processing,
        progress,
        recentlySuccessful,
        isDirty: JSON.stringify(data) !== JSON.stringify(defaults),
        reset,
        setDefaults,
        enviar,
        post: (url, opciones) => enviar('post', url, opciones),
        put: (url, opciones) => enviar('put', url, opciones),
        patch: (url, opciones) => enviar('patch', url, opciones),
        delete: (url, opciones) => enviar('delete', url, opciones),
    };
}
