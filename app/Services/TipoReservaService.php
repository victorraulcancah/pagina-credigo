<?php

namespace App\Services;

use App\Models\TipoReserva;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

/** Lo que se puede reservar en la web (ej. Viaje). Se administra en el panel (Reservas → Tipos). */
class TipoReservaService
{
    /** Todos (visibles u ocultos) con cuántas reservas tiene cada uno, para el panel. */
    public function listar(): Collection
    {
        return TipoReserva::ordenado()->withCount('reservas')->get();
    }

    /** Los que se ofrecen en el formulario de la web. */
    public function activos(): Collection
    {
        return TipoReserva::activo()->ordenado()->get();
    }

    public function crear(array $datos): TipoReserva
    {
        return TipoReserva::create([...$datos, 'slug' => $this->slugLibre($datos['nombre'])]);
    }

    /** La dirección (/reservar?tipo=…) no cambia al renombrarlo: los botones que ya la usan siguen funcionando. */
    public function actualizar(TipoReserva $tipo, array $datos): TipoReserva
    {
        $tipo->update($datos);

        return $tipo->refresh()->loadCount('reservas');
    }

    /** Las reservas que ya tenía se quedan (con el nombre del tipo). */
    public function eliminar(TipoReserva $tipo): void
    {
        $tipo->delete();
    }

    private function slugLibre(string $nombre): string
    {
        $base = Str::slug($nombre) ?: 'reserva';
        $slug = $base;

        for ($n = 2; TipoReserva::where('slug', $slug)->exists(); $n++) {
            $slug = "{$base}-{$n}";
        }

        return $slug;
    }
}
