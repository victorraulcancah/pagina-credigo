<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class MensajeContacto extends Model
{
    protected $table = 'mensajes_contacto';

    protected $fillable = ['nombre', 'telefono', 'email', 'asunto', 'mensaje', 'leido_at', 'ip'];

    protected $hidden = ['ip'];

    protected function casts(): array
    {
        return [
            'leido_at' => 'datetime',
        ];
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
}
