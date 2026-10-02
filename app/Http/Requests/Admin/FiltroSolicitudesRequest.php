<?php

namespace App\Http\Requests\Admin;

use App\Models\MensajeContacto;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Filtros de la bandeja de solicitudes (lista, conteos y Excel). */
class FiltroSolicitudesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'buscar' => ['nullable', 'string', 'max:100'],
            'estado' => ['nullable', Rule::in(['todos', ...array_keys(MensajeContacto::ESTADOS)])],
            'origen' => ['nullable', Rule::in(['todos', ...array_keys(MensajeContacto::ORIGENES)])],
            'asignado' => ['nullable', 'in:todos,mios,sin_asignar'],
        ];
    }
}
