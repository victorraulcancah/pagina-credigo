<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Solicitud o mensaje que llega desde la web (formulario de contacto o cotizador). */
class MensajeContacto extends Model
{
    public const ESTADOS = [
        'nuevo' => 'Nuevo',
        'contactado' => 'Contactado',
        'inscrito' => 'Inscrito',
        'descartado' => 'Descartado',
    ];

    public const ORIGENES = [
        'contacto' => 'Formulario de contacto',
        'cotizador' => 'Cotizador',
    ];

    protected $table = 'mensajes_contacto';

    protected $fillable = [
        'nombre', 'telefono', 'email', 'asunto', 'mensaje', 'origen', 'estado', 'asignado_a', 'notas', 'leido_at', 'ip',
    ];

    protected $hidden = ['ip'];

    protected function casts(): array
    {
        return [
            'leido_at' => 'datetime',
        ];
    }

    public function asignado(): BelongsTo
    {
        return $this->belongsTo(User::class, 'asignado_a');
    }

    public function scopeNoLeido(Builder $query): Builder
    {
        return $query->whereNull('leido_at');
    }

    public function scopeBuscar(Builder $query, ?string $texto): Builder
    {
        if (! $texto) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($texto) {
            $q->where('nombre', 'like', "%{$texto}%")
                ->orWhere('telefono', 'like', "%{$texto}%")
                ->orWhere('email', 'like', "%{$texto}%")
                ->orWhere('asunto', 'like', "%{$texto}%");
        });
    }

    /**
     * Filtros de la bandeja del panel (también se usan al exportar a Excel).
     * `asignado`: todos | mios | sin_asignar
     */
    public function scopeFiltrar(Builder $query, array $filtros, ?int $usuarioId): Builder
    {
        $estado = $filtros['estado'] ?? 'todos';
        $origen = $filtros['origen'] ?? 'todos';
        $asignado = $filtros['asignado'] ?? 'todos';

        return $query
            ->buscar($filtros['buscar'] ?? null)
            ->when($estado !== 'todos', fn ($q) => $q->where('estado', $estado))
            ->when($origen !== 'todos', fn ($q) => $q->where('origen', $origen))
            ->when($asignado === 'mios', fn ($q) => $q->where('asignado_a', $usuarioId))
            ->when($asignado === 'sin_asignar', fn ($q) => $q->whereNull('asignado_a'));
    }
}
