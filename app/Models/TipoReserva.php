<?php

namespace App\Models;

use App\Models\Concerns\Ordenable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Lo que se puede reservar desde la web (ej. Viaje). Se crea en el panel (Reservas → Tipos).
 * `pide_ruta`: el formulario pide origen, destino y pasajeros.
 */
class TipoReserva extends Model
{
    use Ordenable;

    protected $table = 'tipos_reserva';

    protected $fillable = ['nombre', 'slug', 'descripcion', 'pide_ruta', 'orden', 'activo'];

    protected function casts(): array
    {
        return [
            'pide_ruta' => 'boolean',
            'orden' => 'integer',
            'activo' => 'boolean',
        ];
    }

    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class);
    }
}
