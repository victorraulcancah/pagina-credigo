<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Reserva hecha en la web (/reservar). El equipo la confirma por WhatsApp y registra su estado en el panel. */
class Reserva extends Model
{
    public const ESTADOS = [
        'pendiente' => 'Pendiente',
        'confirmada' => 'Confirmada',
        'atendida' => 'Atendida',
        'cancelada' => 'Cancelada',
    ];

    protected $table = 'reservas';

    protected $fillable = [
        'tipo_reserva_id', 'tipo', 'nombre', 'telefono', 'origen', 'destino', 'fecha', 'hora',
        'pasajeros', 'comentario', 'estado', 'notas', 'ip',
    ];

    protected $hidden = ['ip'];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'pasajeros' => 'integer',
        ];
    }

    public function tipoReserva(): BelongsTo
    {
        return $this->belongsTo(TipoReserva::class);
    }

    public function scopePendiente(Builder $query): Builder
    {
        return $query->where('estado', 'pendiente');
    }

    public function scopeBuscar(Builder $query, ?string $texto): Builder
    {
        if (! $texto) {
            return $query;
        }

        return $query->where(fn (Builder $q) => $q
            ->where('nombre', 'like', "%{$texto}%")
            ->orWhere('telefono', 'like', "%{$texto}%")
            ->orWhere('origen', 'like', "%{$texto}%")
            ->orWhere('destino', 'like', "%{$texto}%"));
    }

    /** Filtros de la lista del panel: buscar, estado (o todos) y tipo (id o todos). */
    public function scopeFiltrar(Builder $query, array $filtros): Builder
    {
        $estado = $filtros['estado'] ?? 'todos';
        $tipo = $filtros['tipo'] ?? 'todos';

        return $query
            ->buscar($filtros['buscar'] ?? null)
            ->when($estado !== 'todos', fn ($q) => $q->where('estado', $estado))
            ->when($tipo !== 'todos', fn ($q) => $q->where('tipo_reserva_id', $tipo));
    }
}
