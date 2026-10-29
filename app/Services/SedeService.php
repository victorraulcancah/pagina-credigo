<?php

namespace App\Services;

use App\Models\Sede;
use Illuminate\Database\Eloquent\Collection;

/** Oficinas de la empresa: se administran en el panel y se muestran en el pie y en Soporte. */
class SedeService
{
    public function listar(): Collection
    {
        return Sede::ordenado()->get();
    }

    /** Las que se ven en el sitio, en orden. */
    public function activas(): Collection
    {
        return Sede::activo()->ordenado()->get();
    }

    public function crear(array $datos): Sede
    {
        return Sede::create($datos);
    }

    public function actualizar(Sede $sede, array $datos): Sede
    {
        $sede->update($datos);

        return $sede->refresh();
    }

    public function eliminar(Sede $sede): void
    {
        $sede->delete();
    }
}
