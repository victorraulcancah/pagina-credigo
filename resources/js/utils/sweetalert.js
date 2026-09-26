import Swal from 'sweetalert2';

const colorTema = (variable) => getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

/** Notificación pequeña en la esquina (éxito por defecto). */
export function toast(title, icon = 'success') {
    return Swal.fire({
        toast: true,
        position: 'top-end',
        icon,
        title,
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
    });
}

/** Confirmación de eliminación. Devuelve true si el usuario confirma. */
export async function deleteConfirm(title = '¿Eliminar este registro?', text = 'Esta acción no se puede deshacer.') {
    const { isConfirmed } = await Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: colorTema('--color-primary'),
        reverseButtons: true,
        focusCancel: true,
    });

    return isConfirmed;
}
