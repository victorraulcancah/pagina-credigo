<?php

namespace App\Http\Requests\Admin;

use App\Models\MensajeContacto;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Estado, asesor asignado y notas internas de una solicitud. */
class SeguimientoSolicitudRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'estado' => ['required', Rule::in(array_keys(MensajeContacto::ESTADOS))],
            'asignado_a' => ['nullable', 'exists:users,id'],
            'notas' => ['nullable', 'string', 'max:3000'],
        ];
    }

    public function attributes(): array
    {
        return ['asignado_a' => 'asesor asignado'];
    }
}
