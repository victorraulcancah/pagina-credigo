<?php

namespace App\Models;

use App\Models\Concerns\Ordenable;
use Illuminate\Database\Eloquent\Model;

class PreguntaFrecuente extends Model
{
    use Ordenable;

    protected $table = 'preguntas_frecuentes';

    protected $fillable = ['pregunta', 'respuesta', 'orden', 'activo'];

    protected function casts(): array
    {
        return [
            'orden' => 'integer',
            'activo' => 'boolean',
        ];
    }
}
