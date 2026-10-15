<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Visitas del sitio público en un día (hora de Perú): personas distintas y páginas abiertas. */
class VisitaDiaria extends Model
{
    protected $table = 'visitas_diarias';

    protected $primaryKey = 'fecha';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = ['fecha', 'visitas', 'paginas_vistas'];

    protected function casts(): array
    {
        return [
            'visitas' => 'integer',
            'paginas_vistas' => 'integer',
        ];
    }
}
