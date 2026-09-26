<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PreguntaFrecuenteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pregunta' => ['required', 'string', 'max:255'],
            'respuesta' => ['required', 'string', 'max:2000'],
            'orden' => ['required', 'integer', 'min:0'],
            'activo' => ['boolean'],
        ];
    }
}
