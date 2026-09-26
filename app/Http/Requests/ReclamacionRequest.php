<?php

namespace App\Http\Requests;

use App\Models\Reclamacion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReclamacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipo' => ['required', Rule::in(Reclamacion::TIPOS)],
            'nombre' => ['required', 'string', 'max:150'],
            'tipo_documento' => ['required', Rule::in(Reclamacion::TIPOS_DOCUMENTO)],
            'numero_documento' => [
                'required', 'string', 'max:20',
                Rule::when($this->input('tipo_documento') === 'DNI', ['digits:8']),
                Rule::when($this->input('tipo_documento') === 'RUC', ['digits:11']),
            ],
            'domicilio' => ['required', 'string', 'max:255'],
            'telefono' => ['required', 'string', 'regex:/^\+?[0-9\s]{6,20}$/'],
            'email' => ['required', 'email', 'max:150'],
            'menor_de_edad' => ['boolean'],
            'apoderado' => ['nullable', 'string', 'max:150', 'required_if:menor_de_edad,true,1'],
            'tipo_bien' => ['required', Rule::in(Reclamacion::TIPOS_BIEN)],
            'monto_reclamado' => ['nullable', 'numeric', 'min:0', 'max:9999999'],
            'descripcion_bien' => ['required', 'string', 'max:1000'],
            'detalle' => ['required', 'string', 'max:3000'],
            'pedido' => ['required', 'string', 'max:2000'],
            'acepta_politica' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'acepta_politica.accepted' => 'Debes aceptar la política de privacidad para registrar tu reclamo.',
            'apoderado.required_if' => 'Si eres menor de edad, indica el nombre de tu padre, madre o tutor.',
        ];
    }

    public function attributes(): array
    {
        return [
            'tipo' => 'tipo de reclamación',
            'nombre' => 'nombre completo',
            'tipo_documento' => 'tipo de documento',
            'numero_documento' => 'número de documento',
            'domicilio' => 'domicilio',
            'telefono' => 'teléfono',
            'apoderado' => 'padre, madre o tutor',
            'tipo_bien' => 'tipo de bien',
            'monto_reclamado' => 'monto reclamado',
            'descripcion_bien' => 'descripción del producto o servicio',
            'detalle' => 'detalle',
            'pedido' => 'pedido',
        ];
    }
}
