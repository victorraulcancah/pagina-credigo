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
            'etiqueta' => ['nullable', 'string', 'max:60'],
            'descripcion' => ['required', 'string', 'max:1000'],
            'caracteristicas' => ['nullable', 'array', 'max:10'],
            'caracteristicas.*' => ['required', 'string', 'max:150'],
            'icono' => ['nullable', 'string', 'max:50'],
            'imagen' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'quitar_imagen' => ['boolean'],
            'destacado' => ['boolean'],
            'orden' => ['required', 'integer', 'min:0'],
            'activo' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'caracteristicas.*.required' => 'No dejes características vacías (quítalas si no las usas).',
        ];
    }

    /** Datos a guardar: si se quitaron todas las características, el campo no llega → lista vacía. */
    public function datos(): array
    {
        return [
            ...$this->safe()->except(['imagen', 'quitar_imagen']),
            'caracteristicas' => array_values($this->validated('caracteristicas') ?? []),
        ];
    }
}
