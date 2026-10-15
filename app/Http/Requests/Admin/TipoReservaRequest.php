<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/** Tipo de reserva (ej. Viaje). La dirección (/reservar?tipo=…) se arma sola con el nombre. */
class TipoReservaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:60'],
            'descripcion' => ['nullable', 'string', 'max:160'],
            'pide_ruta' => ['boolean'],
            'orden' => ['required', 'integer', 'min:0'],
            'activo' => ['boolean'],
        ];
    }

    public function attributes(): array
    {
        return ['pide_ruta' => 'pide origen y destino'];
    }
}
