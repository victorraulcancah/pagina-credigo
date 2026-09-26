<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/** Guarda y elimina imágenes subidas desde el panel (disco `public`). */
class ImagenService
{
    private const DISCO = 'public';

    public function guardar(UploadedFile $archivo, string $carpeta): string
    {
        return $archivo->store($carpeta, self::DISCO);
    }

    /** Guarda la nueva imagen y borra la anterior. */
    public function reemplazar(?string $anterior, UploadedFile $archivo, string $carpeta): string
    {
        $ruta = $this->guardar($archivo, $carpeta);
        $this->eliminar($anterior);

        return $ruta;
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
