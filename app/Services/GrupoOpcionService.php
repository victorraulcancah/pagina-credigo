<?php

namespace App\Services;

use App\Models\GrupoOpcion;

/** Secciones con logo dentro de la lista de opciones de un plan (ej. "Descuentos con YANGO"). */
class GrupoOpcionService
{
    private const CARPETA = 'grupos-opcion';

    public function __construct(private ImagenService $imagenes) {}

    public function crear(array $datos): GrupoOpcion
    {
        return GrupoOpcion::create([...$this->sinArchivos($datos), ...$this->imagenes->resolver($datos, null, self::CARPETA)]);
    }

    public function actualizar(GrupoOpcion $grupo, array $datos): GrupoOpcion
    {
        $grupo->update([...$this->sinArchivos($datos), ...$this->imagenes->resolver($datos, $grupo->imagen, self::CARPETA)]);

        return $grupo->refresh();
    }

    /** Sus opciones no se borran: quedan sueltas, sin sección. */
    public function eliminar(GrupoOpcion $grupo): void
    {
        $this->imagenes->eliminar($grupo->imagen);
        $grupo->delete();
    }

    private function sinArchivos(array $datos): array
    {
        return collect($datos)->except(['imagen', 'quitar_imagen'])->all();
    }
}
