import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { deleteConfirm } from '@/utils/sweetalert';

/**
 * CRUD con formulario en modal para listas del panel (banners, servicios, preguntas).
 *
 * const crud = useCrudModal({ url: '/admin/banners', vacio: {...}, aFormulario: (item) => ({...}) });
 * crud.abrirNuevo() · crud.abrirEditar(item) · crud.guardar(e) · crud.eliminar(item, 'nombre')
 *
 * Envía siempre FormData (soporta imágenes); al editar usa POST + _method=put.
 */
export function useCrudModal({ url, vacio, aFormulario = (item) => item }) {
    const [abierto, setAbierto] = useState(false);
    const [editando, setEditando] = useState(null);
    const form = useForm(vacio);

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
        const opciones = { preserveScroll: true, forceFormData: true, onSuccess: () => setAbierto(false) };

        if (editando) {
            form.transform((datos) => ({ ...datos, _method: 'put' }));
            form.post(`${url}/${editando.id}`, opciones);
        } else {
            form.transform((datos) => datos);
            form.post(url, opciones);
        }
    };

    const eliminar = async (item, nombre = 'este registro') => {
        if (await deleteConfirm(`¿Eliminar ${nombre}?`)) {
            router.delete(`${url}/${item.id}`, { preserveScroll: true });
        }
    };

    return { form, abierto, editando, abrirNuevo, abrirEditar, cerrar, guardar, eliminar };
}
