import { formatoFecha } from '@/lib/fechas';

// Las fechas sin hora ("2026-09-20") se leen a mediodía para evitar desfases de zona horaria
const fechaSimple = (fecha) => (fecha ? formatoFecha(`${fecha}T12:00:00`, false) : null);

/** Filas [etiqueta, valor] de una hoja de reclamación (constancia pública y panel). */
export function filasHoja(r) {
    const producto = [r.producto_nombre, r.producto_marca, r.producto_modelo].filter(Boolean).join(' · ');
    const comprobante = [r.comprobante_texto, r.comprobante_numero].filter(Boolean).join(' ');

    return [
        ['Consumidor', `${r.nombre}\n${r.tipo_documento} ${r.numero_documento}`],
        ['Contacto', `${r.telefono} · ${r.email}`],
        ['Dirección', r.domicilio],
        r.menor_de_edad && ['Apoderado', `${r.apoderado}\n${r.apoderado_tipo_documento ?? ''} ${r.apoderado_numero_documento ?? ''}`.trim()],
        ['Tipo de bien', r.tipo_bien === 'producto' ? 'Producto' : 'Servicio'],
        ['Descripción', r.descripcion_bien],
        producto && ['Producto', `${producto}${r.producto_codigo ? ` (código ${r.producto_codigo})` : ''}`],
        (comprobante || r.fecha_compra) && ['Comprobante', [comprobante, fechaSimple(r.fecha_compra)].filter(Boolean).join(' — ')],
        r.numero_contrato && ['Código de asociado / contrato', r.numero_contrato],
        ['Monto reclamado', `S/ ${Number(r.monto_reclamado ?? 0).toFixed(2)}`],
        ['Tipo de registro', r.tipo === 'reclamo' ? 'Reclamo' : 'Queja'],
        ['Detalle', r.detalle],
        r.solucion_texto && ['Solución esperada', r.solucion_texto],
        ['Pedido', r.pedido],
    ].filter(Boolean);
}

export const ETIQUETA_ADJUNTO = { foto: 'Fotografía', comprobante: 'Comprobante', video: 'Video' };

export const tamanoArchivo = (bytes) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`);
