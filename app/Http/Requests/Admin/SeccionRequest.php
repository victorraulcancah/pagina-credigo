<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SeccionRequest extends FormRequest
{
    private const COLOR_HEX = '/^#[0-9a-fA-F]{6}$/';

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subtitulo' => ['nullable', 'string', 'max:150'],
            'titulo' => ['nullable', 'string', 'max:255'],
            'contenido' => ['nullable', 'string', 'max:5000'],
            // Colores del título y del texto (encabezados). Vacío = blanco
            'color_titulo' => ['nullable', 'regex:'.self::COLOR_HEX],
            'color_texto' => ['nullable', 'regex:'.self::COLOR_HEX],
            'imagen' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'quitar_imagen' => ['boolean'],
            'boton_texto' => ['nullable', 'string', 'max:60', 'required_with:boton_url'],
            'boton_url' => ['nullable', 'string', 'max:255', 'regex:'.EnlaceRegla::PATRON],
            'video_url' => VideoRegla::reglas(),
            'items' => ['nullable', 'array', 'max:12'],
            'items.*.titulo' => ['required', 'string', 'max:100'],
            'items.*.descripcion' => ['nullable', 'string', 'max:300'],
            'items.*.icono' => ['nullable', 'string', 'max:50'],
            'activo' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            ...EnlaceRegla::mensajes('boton_url'),
            ...VideoRegla::mensajes('video_url'),
            'items.*.titulo.required' => 'Cada elemento de la lista necesita un título.',
            'color_titulo.regex' => 'El color debe tener formato hexadecimal (ej. #ffffff).',
            'color_texto.regex' => 'El color debe tener formato hexadecimal (ej. #ffffff).',
        ];
    }

    public function attributes(): array
    {
        return ['boton_texto' => 'texto del botón', 'boton_url' => 'enlace del botón', 'video_url' => 'enlace del video'];
    }
}
