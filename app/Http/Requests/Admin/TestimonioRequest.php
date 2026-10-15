<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TestimonioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:80'],
            'slug' => ['nullable', 'string', 'max:120', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('testimonios', 'slug')->ignore($this->route('testimonio'))],
            'titulo' => ['nullable', 'string', 'max:150'],
            'ciudad' => ['nullable', 'string', 'max:60'],
            'comentario' => ['required', 'string', 'max:400'],
            'historia' => ['nullable', 'string', 'max:10000'],
            'foto' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'quitar_foto' => ['boolean'],
            'foto_vehiculo' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'quitar_foto_vehiculo' => ['boolean'],
            'vehiculo' => ['nullable', 'string', 'max:80'],
            'calificacion' => ['nullable', 'integer', 'between:1,5'],
            'video_url' => VideoRegla::reglas(),
            // Su nombre, foto y comentario son datos personales: sin su autorización no se publica
            'autorizado' => ['boolean', Rule::when($this->boolean('activo'), ['accepted'])],
            'orden' => ['required', 'integer', 'min:0'],
            'activo' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            ...VideoRegla::mensajes('video_url'),
            'slug.regex' => 'La dirección solo puede tener minúsculas, números y guiones. Ej. edimar-rios',
            'slug.unique' => 'Otra historia ya usa esta dirección.',
            'autorizado.accepted' => 'Para publicarlo necesitas la autorización del conductor. Si aún no la tienes, guárdalo como oculto.',
        ];
    }

    public function attributes(): array
    {
        return [
            'foto' => 'foto del conductor',
            'foto_vehiculo' => 'foto del vehículo',
            'calificacion' => 'calificación',
            'slug' => 'dirección en la web',
            'titulo' => 'titular',
            'historia' => 'historia completa',
        ];
    }
}
