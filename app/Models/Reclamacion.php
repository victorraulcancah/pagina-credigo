<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Reclamacion extends Model
{
    public const TIPOS = ['reclamo', 'queja'];

    public const TIPOS_DOCUMENTO = ['DNI', 'CE', 'PASAPORTE', 'RUC'];

    public const TIPOS_BIEN = ['producto', 'servicio'];

    public const TIPOS_COMPROBANTE = [
        'boleta' => 'Boleta de venta',
        'factura' => 'Factura',
        'nota_venta' => 'Nota de venta',
        'contrato' => 'Contrato',
        'otro' => 'Otro',
    ];

    public const SOLUCIONES = [
        'devolucion' => 'Devolución del dinero',
        'cambio' => 'Cambio o reposición del producto',
        'reparacion' => 'Reparación o mantenimiento',
        'cumplimiento' => 'Cumplimiento del servicio contratado',
        'correccion_cobro' => 'Corrección de cobros o cuotas',
        'otra' => 'Otra solución',
    ];

    // Plazo legal de respuesta (Ley N° 31435): 15 días hábiles
    public const DIAS_HABILES_RESPUESTA = 15;

    protected $table = 'reclamaciones';

    protected $fillable = [
        'codigo', 'tipo', 'nombre', 'tipo_documento', 'numero_documento', 'domicilio', 'telefono', 'email',
        'menor_de_edad', 'apoderado', 'apoderado_tipo_documento', 'apoderado_numero_documento',
        'tipo_bien', 'comprobante_tipo', 'comprobante_numero', 'fecha_compra', 'numero_contrato',
        'producto_codigo', 'producto_nombre', 'producto_marca', 'producto_modelo',
        'monto_reclamado', 'descripcion_bien', 'detalle', 'solucion_esperada', 'solucion_otra', 'pedido',
        'declara_veracidad', 'acepta_datos', 'conforme',
        'proveedor', 'estado', 'respuesta', 'respondido_at', 'respondido_por', 'ip',
    ];

    protected $hidden = ['ip'];

    protected $appends = ['fecha_limite', 'vencido', 'solucion_texto', 'comprobante_texto'];

    protected function casts(): array
    {
        return [
            'menor_de_edad' => 'boolean',
            'monto_reclamado' => 'decimal:2',
            'fecha_compra' => 'date:Y-m-d',
            'declara_veracidad' => 'boolean',
            'acepta_datos' => 'boolean',
            'conforme' => 'boolean',
            'proveedor' => 'array',
            'respondido_at' => 'datetime',
        ];
    }

    public function respondidoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'respondido_por');
    }

    public function adjuntos(): HasMany
    {
        return $this->hasMany(ReclamacionAdjunto::class);
    }

    /** Solución esperada en texto (la "otra" escrita por el consumidor si eligió esa opción). */
    protected function solucionTexto(): Attribute
    {
        return Attribute::get(fn () => $this->solucion_esperada === 'otra'
            ? $this->solucion_otra
            : (self::SOLUCIONES[$this->solucion_esperada] ?? null));
    }

    protected function comprobanteTexto(): Attribute
    {
        return Attribute::get(fn () => self::TIPOS_COMPROBANTE[$this->comprobante_tipo] ?? null);
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
