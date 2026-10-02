<?php

namespace App\Services;

use App\Models\PreguntaFrecuente;
use Illuminate\Database\Eloquent\Collection;

class PreguntaFrecuenteService
{
    public function listar(): Collection
    {
        return PreguntaFrecuente::ordenado()->get();
    }

    /** Las que se ven en el sitio (inicio y soporte). */
    public function activas(): Collection
    {
        return PreguntaFrecuente::activo()->ordenado()->get();
    }

    public function crear(array $datos): PreguntaFrecuente
    {
        return PreguntaFrecuente::create($datos);
    }

    public function actualizar(PreguntaFrecuente $pregunta, array $datos): PreguntaFrecuente
    {
        $pregunta->update($datos);

        return $pregunta->refresh();
    }

    public function eliminar(PreguntaFrecuente $pregunta): void
    {
        $pregunta->delete();
    }
}
