<?php

namespace App\Http\Requests\Admin;

use App\Models\Reserva;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Estado y notas internas de una reserva. */
class SeguimientoReservaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'estado' => ['required', Rule::in(array_keys(Reserva::ESTADOS))],
            'notas' => ['nullable', 'string', 'max:3000'],
        ];
    }
}
