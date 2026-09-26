<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:150'],
            'subtitulo' => ['nullable', 'string', 'max:255'],
            'imagen' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'quitar_imagen' => ['boolean'],
            'boton_texto' => ['nullable', 'string', 'max:60', 'required_with:boton_url'],
            'boton_url' => ['nullable', 'string', 'max:255', 'regex:'.EnlaceRegla::PATRON],
            'orden' => ['required', 'integer', 'min:0'],
            'activo' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return EnlaceRegla::mensajes('boton_url');
    }

    public function attributes(): array
    {
        return ['boton_texto' => 'texto del botón', 'boton_url' => 'enlace del botón'];
    }
}
