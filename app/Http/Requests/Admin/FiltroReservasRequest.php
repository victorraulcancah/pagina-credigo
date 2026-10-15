<?php

namespace App\Http\Requests\Admin;

use App\Models\Reserva;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Filtros de la lista de reservas del panel. */
class FiltroReservasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'buscar' => ['nullable', 'string', 'max:100'],
            'estado' => ['nullable', Rule::in(['todos', ...array_keys(Reserva::ESTADOS)])],
            'tipo' => ['nullable', 'regex:/^(todos|\d+)$/'],
        ];
    }
}
