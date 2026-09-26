<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'etiqueta' => ['nullable', 'string', 'max:100'],
            'titulo' => ['required', 'string', 'max:150'],
            'subtitulo' => ['nullable', 'string', 'max:255'],
            'imagen' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'quitar_imagen' => ['boolean'],
            'solo_imagen' => ['boolean'],
            'imagen_movil' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'quitar_imagen_movil' => ['boolean'],
            // En "solo imagen" el enlace es la imagen completa: no lleva texto de botón
            'boton_texto' => [
                'nullable', 'string', 'max:60',
                Rule::requiredIf(fn () => ! $this->boolean('solo_imagen') && $this->filled('boton_url')),
            ],
            'boton_url' => ['nullable', 'string', 'max:255', 'regex:'.EnlaceRegla::PATRON],
            'boton2_texto' => ['nullable', 'string', 'max:60', 'required_with:boton2_url'],
            'boton2_url' => ['nullable', 'string', 'max:255', 'regex:'.EnlaceRegla::PATRON],
            'orden' => ['required', 'integer', 'min:0'],
            'activo' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [...EnlaceRegla::mensajes('boton_url'), ...EnlaceRegla::mensajes('boton2_url')];
    }

    public function attributes(): array
    {
        return [
            'boton_texto' => 'texto del botón',
            'boton_url' => 'enlace del botón',
            'boton2_texto' => 'texto del segundo botón',
            'boton2_url' => 'enlace del segundo botón',
        ];
    }
}
