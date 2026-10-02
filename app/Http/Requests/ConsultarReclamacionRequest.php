<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** Consulta pública del estado de una hoja: su número y el documento de quien la registró. */
class ConsultarReclamacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'codigo' => ['required', 'string', 'max:20'],
            'numero_documento' => ['required', 'string', 'max:20'],
        ];
    }

    public function attributes(): array
    {
        return ['codigo' => 'número de hoja', 'numero_documento' => 'número de documento'];
    }
}
