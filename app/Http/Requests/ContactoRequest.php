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
        // Mismos campos obligatorios que el formulario de soporte del ERP (el celular
        // también, porque las solicitudes se atienden por WhatsApp)
        $esContacto = $this->input('origen', 'contacto') === 'contacto';

        return [
            'nombre' => ['required', 'string', 'max:100'],
            'apellido' => [Rule::requiredIf($esContacto), 'nullable', 'string', 'max:100'],
            'telefono' => ['required', 'string', 'regex:/^\+?[0-9\s]{6,20}$/'],
            'email' => [Rule::requiredIf($esContacto), 'nullable', 'email', 'max:150'],
            'tipo_consulta' => [Rule::requiredIf($esContacto), 'nullable', Rule::in(array_keys(MensajeContacto::TIPOS_CONSULTA))],
            'asunto' => [Rule::requiredIf($esContacto), 'nullable', 'string', 'max:150'],
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
            'tipo_consulta' => 'tipo de consulta',
        ];
    }
}
