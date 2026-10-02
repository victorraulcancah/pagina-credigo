import { useState } from 'react';
import { useFormApi } from '@/hooks/useFormApi';
import { deleteConfirm } from '@/utils/sweetalert';

/**
 * CRUD con formulario en modal para listas del panel (banners, servicios, preguntas, documentos),
 * guardando por la API REST. `url`: recurso de la API sin "/api" (ej. '/admin/banners').
 *
 * const crud = useCrudModal({ url: '/admin/banners', vacio: {...}, aFormulario: (item) => ({...}) });
 * crud.abrirNuevo() · crud.abrirEditar(item) · crud.guardar(e) · crud.eliminar(item, 'nombre')
 *
 * Crear: POST url · Editar: PUT url/{id} (con archivos va como POST + _method) · Eliminar: DELETE url/{id}.
 * Después de cada cambio la lista se recarga desde el servidor.
 */
export function useCrudModal({ url, vacio, aFormulario = (item) => item }) {
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
        const opciones = { onSuccess: () => setAbierto(false) };

        return editando ? form.put(`${url}/${editando.id}`, opciones) : form.post(url, opciones);
    };

    const eliminar = async (item, nombre = 'este registro') => {
        if (await deleteConfirm(`¿Eliminar ${nombre}?`)) {
            return form.delete(`${url}/${item.id}`);
        }
        return { success: false };
    };

    return { form, abierto, editando, abrirNuevo, abrirEditar, cerrar, guardar, eliminar };
}
