<?php

namespace App\Http\Requests\Admin;

use App\Models\Articulo;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ArticuloRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** Un enlace corto de TikTok (botón "Compartir" del celular) se completa antes de validar. */
    protected function prepareForValidation(): void
    {
        VideoRegla::completar($this);
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:160'],
            'slug' => ['nullable', 'string', 'max:180', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('articulos', 'slug')->ignore($this->route('articulo'))],
            // Eventos, Noticias o Tendencias: la dirección del artículo va dentro de su categoría
            'categoria_blog_id' => ['required', 'integer', 'exists:categorias_blog,id'],
            'resumen' => ['nullable', 'string', 'max:300'],
            // Un artículo nuevo se arma con bloques; `contenido` (texto suelto) sigue valiendo para los anteriores
            'contenido' => ['required_without:bloques', 'nullable', 'string', 'max:50000'],
            'bloques' => ['required_without:contenido', 'nullable', 'array', 'max:60', $this->conAlgoQueMostrar(...)],
            'bloques.*.tipo' => ['required', Rule::in(['texto', 'fotos'])],
            'bloques.*.html' => ['nullable', 'string', 'max:50000'],
            'bloques.*.fotos' => ['nullable', 'array', 'max:12'],
            'bloques.*.fotos.*.src' => ['required', 'string', 'max:500', 'regex:#^(https?://|/)#'],
            'bloques.*.fotos.*.alt' => ['nullable', 'string', 'max:200'],
            'bloques.*.diseno' => ['nullable', Rule::in(Articulo::DISENOS)],
            'bloques.*.columnas' => ['nullable', Rule::in([2, 3, 4])],
            'bloques.*.tamano' => ['nullable', Rule::in(Articulo::TAMANOS)],
            'bloques.*.alineacion' => ['nullable', Rule::in(Articulo::ALINEACIONES)],
            'bloques.*.proporcion' => ['nullable', Rule::in(Articulo::PROPORCIONES)],
            'bloques.*.animacion' => ['nullable', Rule::in(Articulo::ANIMACIONES)],
            'portada' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'quitar_portada' => ['boolean'],
            'video_url' => VideoRegla::reglas(),
            'autor' => ['nullable', 'string', 'max:80'],
            'publicado' => ['boolean'],
            'destacado' => ['boolean'],
            'publicado_at' => ['nullable', 'date'],
        ];
    }

    /** Al menos un bloque con texto o con fotos (los bloques de texto vacíos no cuentan). */
    private function conAlgoQueMostrar(string $atributo, mixed $bloques, Closure $fallar): void
    {
        $hay = collect($bloques)->contains(fn ($bloque) => ($bloque['tipo'] ?? null) === 'fotos'
            ? ! empty($bloque['fotos'])
            : trim(strip_tags((string) ($bloque['html'] ?? ''))) !== '');

        if (! $hay) {
            $fallar('Agrega texto o fotos al artículo.');
        }
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
