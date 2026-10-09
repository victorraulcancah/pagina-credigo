<?php

namespace App\Models;

use App\Models\Concerns\Ordenable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OpcionPlan extends Model
{
    use Ordenable;

    public const MONEDAS = ['PEN', 'USD'];

    public const FRECUENCIAS = ['semanal', 'quincenal', 'mensual'];

    protected $table = 'opciones_plan';

    protected $fillable = [
        'servicio_id', 'erp_ref', 'nombre', 'nota', 'moneda', 'moneda_inicial', 'inicial', 'cuota', 'numero_cuotas', 'frecuencia', 'orden', 'activo',
    ];

    protected function casts(): array
    {
        return [
            'inicial' => 'float',
            'cuota' => 'float',
            'numero_cuotas' => 'integer',
            'orden' => 'integer',
            'activo' => 'boolean',
        ];
    }

    public function servicio(): BelongsTo
    {
        return $this->belongsTo(Servicio::class);
    }
}
