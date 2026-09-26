<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class Reclamacion extends Model
{
    public const TIPOS = ['reclamo', 'queja'];

    public const TIPOS_DOCUMENTO = ['DNI', 'CE', 'PASAPORTE', 'RUC'];

    public const TIPOS_BIEN = ['producto', 'servicio'];

    // Plazo legal de respuesta (Ley N° 31435): 15 días hábiles
    public const DIAS_HABILES_RESPUESTA = 15;

    protected $table = 'reclamaciones';

    protected $fillable = [
        'codigo', 'tipo', 'nombre', 'tipo_documento', 'numero_documento', 'domicilio', 'telefono', 'email',
        'menor_de_edad', 'apoderado', 'tipo_bien', 'monto_reclamado', 'descripcion_bien', 'detalle', 'pedido',
        'proveedor', 'estado', 'respuesta', 'respondido_at', 'respondido_por', 'ip',
    ];

    protected $hidden = ['ip'];

    protected $appends = ['fecha_limite', 'vencido'];

    protected function casts(): array
    {
        return [
            'menor_de_edad' => 'boolean',
            'monto_reclamado' => 'decimal:2',
            'proveedor' => 'array',
            'respondido_at' => 'datetime',
        ];
    }

    public function respondidoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'respondido_por');
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

        return $query->where(function (Builder $q) use ($texto) {
            $q->where('codigo', 'like', "%{$texto}%")
                ->orWhere('nombre', 'like', "%{$texto}%")
                ->orWhere('numero_documento', 'like', "%{$texto}%");
        });
    }

    /** Fecha máxima de respuesta: 15 días hábiles (lunes a viernes) desde el registro. */
    protected function fechaLimite(): Attribute
    {
        return Attribute::get(fn () => $this->created_at
            ? Carbon::parse($this->created_at)->addWeekdays(self::DIAS_HABILES_RESPUESTA)->toDateString()
            : null);
    }

    protected function vencido(): Attribute
    {
        return Attribute::get(fn () => $this->estado === 'pendiente'
            && $this->fecha_limite
            && now()->startOfDay()->gt(Carbon::parse($this->fecha_limite)));
    }
}
