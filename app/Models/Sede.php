<?php

namespace App\Models;

use App\Models\Concerns\Ordenable;
use Illuminate\Database\Eloquent\Model;

/** Oficina de la empresa (ciudad y dirección, con teléfono, horario y mapa opcionales). */
class Sede extends Model
{
    use Ordenable;

    protected $table = 'sedes';

    protected $fillable = ['ciudad', 'nombre', 'direccion', 'telefono', 'horario', 'mapa_url', 'orden', 'activo'];

    protected function casts(): array
    {
        return [
            'orden' => 'integer',
            'activo' => 'boolean',
        ];
    }
}
