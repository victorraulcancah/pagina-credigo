<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ServicioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:150'],
            'descripcion' => ['required', 'string', 'max:1000'],
            'icono' => ['nullable', 'string', 'max:50'],
            'imagen' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'quitar_imagen' => ['boolean'],
            'destacado' => ['boolean'],
            'orden' => ['required', 'integer', 'min:0'],
            'activo' => ['boolean'],
        ];
    }
}
