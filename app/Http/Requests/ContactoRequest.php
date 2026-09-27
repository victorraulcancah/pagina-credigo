<?php

namespace App\Http\Requests;

use App\Models\MensajeContacto;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ContactoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:120'],
            'telefono' => ['required', 'string', 'regex:/^\+?[0-9\s]{6,20}$/'],
            'email' => ['nullable', 'email', 'max:150'],
            'asunto' => ['nullable', 'string', 'max:150'],
            'mensaje' => ['required', 'string', 'max:2000'],
            'origen' => ['nullable', Rule::in(array_keys(MensajeContacto::ORIGENES))],
            // Campo trampa para bots: los humanos no lo ven, debe llegar vacío
            'website' => ['nullable', 'string'],
            // Consentimiento para tratar sus datos (Ley N° 29733)
            'acepta_politica' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'acepta_politica.accepted' => 'Debes aceptar la política de privacidad para enviar tu mensaje.',
        ];
    }

    public function attributes(): array
    {
        return [
            'telefono' => 'celular',
        ];
    }
}
