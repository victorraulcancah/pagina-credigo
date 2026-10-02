<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/** Guarda y elimina los archivos subidos desde el panel (imágenes y PDFs, disco `public`). */
class ImagenService
{
    private const DISCO = 'public';

    public function guardar(UploadedFile $archivo, string $carpeta): string
    {
        return $archivo->store($carpeta, self::DISCO);
    }

    /** Guarda con un nombre elegido (ej. el de un PDF que verá quien lo descarga). */
    public function guardarComo(UploadedFile $archivo, string $carpeta, string $nombre): string
    {
        return $archivo->storeAs($carpeta, $nombre, self::DISCO);
    }

    /** Guarda la nueva imagen y borra la anterior. */
    public function reemplazar(?string $anterior, UploadedFile $archivo, string $carpeta): string
    {
        $ruta = $this->guardar($archivo, $carpeta);
        $this->eliminar($anterior);

        return $ruta;
    }

    /**
     * Resuelve el campo de imagen de los datos validados de un formulario del panel:
     * archivo nuevo → se guarda (y se borra el anterior); `quitar_{campo}` → se borra;
     * sin cambios → arreglo vacío. El resultado se mezcla con los datos a guardar.
     */
    public function resolver(array $datos, ?string $actual, string $carpeta, string $campo = 'imagen'): array
    {
        if (($datos[$campo] ?? null) instanceof UploadedFile) {
            return [$campo => $this->reemplazar($actual, $datos[$campo], $carpeta)];
        }

        if (filter_var($datos["quitar_{$campo}"] ?? false, FILTER_VALIDATE_BOOLEAN)) {
            $this->eliminar($actual);

            return [$campo => null];
        }

        return [];
    }

    public function eliminar(?string $ruta): void
    {
        if ($ruta && Storage::disk(self::DISCO)->exists($ruta)) {
            Storage::disk(self::DISCO)->delete($ruta);
        }
    }

    public function url(?string $ruta): ?string
    {
        return $ruta ? Storage::disk(self::DISCO)->url($ruta) : null;
    }
}
