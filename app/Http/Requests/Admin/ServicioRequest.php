<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            // Vacía = se arma con el nombre del plan
            'slug' => ['nullable', 'string', 'max:120', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('servicios', 'slug')->ignore($this->route('servicio'))],
            'etiqueta' => ['nullable', 'string', 'max:60'],
            'descripcion' => ['required', 'string', 'max:1000'],
            'detalle' => ['nullable', 'string', 'max:10000'],
            'caracteristicas' => ['nullable', 'array', 'max:10'],
            'caracteristicas.*' => ['required', 'string', 'max:150'],
            'icono' => ['nullable', 'string', 'max:50'],
            'imagen' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'quitar_imagen' => ['boolean'],
            'video_url' => VideoRegla::reglas(),
            'destacado' => ['boolean'],
            'orden' => ['required', 'integer', 'min:0'],
            'activo' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'caracteristicas.*.required' => 'No dejes características vacías (quítalas si no las usas).',
            ...VideoRegla::mensajes('video_url'),
            'slug.regex' => 'La dirección solo puede tener minúsculas, números y guiones. Ej. credi-motos',
            'slug.unique' => 'Otro plan ya usa esta dirección.',
        ];
    }

    public function attributes(): array
    {
        return ['slug' => 'dirección en la web', 'detalle' => 'detalle del plan'];
    }
}
