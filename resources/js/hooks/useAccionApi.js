import { router } from '@inertiajs/react';
import { useState } from 'react';
import api, { erroresDeValidacion, mensajeDeError } from '@/lib/api';
import { errorAlert, toast } from '@/utils/sweetalert';

/**
 * Acción puntual contra la API REST (sin formulario): sincronizar el ERP, marcar como leído,
 * eliminar, agregar un precio del ERP… `url` sin "/api" (ej. '/admin/erp/sincronizar').
 *
 * const { ejecutar, enCurso } = useAccionApi();
 * await ejecutar('post', url, datos, { recargar = true, avisar = true }) → { success, data }
 *
 * Avisa con el mensaje de la API y recarga los datos de la página (también si falla:
 * por ejemplo, una sincronización parcial con el ERP igual actualiza lo que sí llegó).
 */
export function useAccionApi() {
    const [enCurso, setEnCurso] = useState(false);

    const ejecutar = async (metodo, url, datos, { recargar = true, avisar = true } = {}) => {
        setEnCurso(true);

        try {
            const respuesta = metodo === 'delete' ? await api.delete(url) : await api[metodo](url, datos);
            if (avisar && respuesta.data?.message) toast(respuesta.data.message);

            return { success: true, data: respuesta.data?.data };
        } catch (error) {
            const primerError = Object.values(erroresDeValidacion(error))[0];
            errorAlert('No se pudo completar', primerError ?? mensajeDeError(error));

            return { success: false };
        } finally {
            setEnCurso(false);
            if (recargar) router.reload({ preserveScroll: true });
        }
    };

    return { ejecutar, enCurso };
}
