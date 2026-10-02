import { useState } from 'react';
import { useFormApi } from '@/hooks/useFormApi';
import { deleteConfirm } from '@/utils/sweetalert';

/**
 * CRUD con formulario en modal para listas del panel (banners, servicios, preguntas, documentos),
 * todo por la API REST. `url`: recurso de la API sin "/api" (ej. '/admin/banners').
 *
 * const lista = useConsulta('/admin/banners');
 * const crud = useCrudModal({ url: '/admin/banners', vacio: {...}, aFormulario: (item) => ({...}), recargar: lista.recargar });
 * crud.abrirNuevo() · crud.abrirEditar(item) · crud.guardar(e) · crud.eliminar(item, 'nombre')
 *
 * Crear: POST url · Editar: PUT url/{id} (con archivos va como POST + _method) · Eliminar: DELETE url/{id}.
 * Después de cada cambio se llama a `recargar` para volver a pedir la lista.
 */
export function useCrudModal({ url, vacio, aFormulario = (item) => item, recargar = true }) {
    const [abierto, setAbierto] = useState(false);
    const [editando, setEditando] = useState(null);
    const form = useFormApi(vacio);

    /** `extra`: valores iniciales adicionales (ej. { orden: items.length }). */
    const abrirNuevo = (extra = {}) => {
        setEditando(null);
        form.setData({ ...vacio, ...extra });
        form.clearErrors();
        setAbierto(true);
    };

    const abrirEditar = (item) => {
        setEditando(item);
        form.setData(aFormulario(item));
        form.clearErrors();
        setAbierto(true);
    };

    const cerrar = () => setAbierto(false);

    const guardar = (e) => {
        e?.preventDefault();
        const opciones = { recargar, onSuccess: () => setAbierto(false) };

        return editando ? form.put(`${url}/${editando.id}`, opciones) : form.post(url, opciones);
    };

    const eliminar = async (item, nombre = 'este registro') => {
        if (await deleteConfirm(`¿Eliminar ${nombre}?`)) {
            return form.delete(`${url}/${item.id}`, { recargar });
        }
        return { success: false };
    };

    return { form, abierto, editando, abrirNuevo, abrirEditar, cerrar, guardar, eliminar };
}
