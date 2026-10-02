/** Peso de un archivo para mostrar: "850 KB" o "1,2 MB". */
export const formatoTamano = (bytes) =>
    bytes >= 1048576
        ? `${(bytes / 1048576).toLocaleString('es-PE', { maximumFractionDigits: 1 })} MB`
        : `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
