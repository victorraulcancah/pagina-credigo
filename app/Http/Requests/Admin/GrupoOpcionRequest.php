<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class GrupoOpcionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'servicio_id' => ['required', 'exists:servicios,id'],
            'titulo' => ['required', 'string', 'max:100'],
            'imagen' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
            'quitar_imagen' => ['boolean'],
            'orden' => ['required', 'integer', 'min:0'],
        ];
    }

    public function attributes(): array
    {
        return [
            'servicio_id' => 'plan',
            'titulo' => 'título',
            'imagen' => 'logo',
        ];
    }
}
