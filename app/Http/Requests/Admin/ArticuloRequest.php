<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ArticuloRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:160'],
            'slug' => ['nullable', 'string', 'max:180', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('articulos', 'slug')->ignore($this->route('articulo'))],
            'categoria_blog_id' => ['nullable', 'integer', 'exists:categorias_blog,id'],
            'resumen' => ['nullable', 'string', 'max:300'],
            'contenido' => ['required', 'string', 'max:50000'],
            'portada' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'quitar_portada' => ['boolean'],
            'video_url' => VideoRegla::reglas(),
            'autor' => ['nullable', 'string', 'max:80'],
            'publicado' => ['boolean'],
            'destacado' => ['boolean'],
            'publicado_at' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            ...VideoRegla::mensajes('video_url'),
            'slug.regex' => 'La dirección solo puede tener minúsculas, números y guiones. Ej. como-pagar-tu-cuota',
            'slug.unique' => 'Otro artículo ya usa esta dirección.',
        ];
    }

    public function attributes(): array
    {
        return [
            'titulo' => 'título',
            'slug' => 'dirección en la web',
            'categoria_blog_id' => 'categoría',
            'publicado_at' => 'fecha de publicación',
        ];
    }
}
