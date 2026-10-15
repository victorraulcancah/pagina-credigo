<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Artículo del blog (la ruta de la portada no sale: solo su URL). El contenido completo
 * solo va en la página del artículo y en el panel (en las listas sobra).
 */
class ArticuloResource extends JsonResource
{
    /** Incluir el contenido completo (página del artículo). */
    private bool $conContenido = false;

    public function conContenido(): static
    {
        $this->conContenido = true;

        return $this;
    }

    public function toArray(Request $request): array
    {
        $panel = $request->is('api/admin/*');

        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'slug' => $this->slug,
            'resumen' => $this->resumen,
            'contenido' => $this->when($this->conContenido || $panel, $this->contenido),
            'portada_url' => $this->portada_url,
            'video_url' => $this->video_url,
            'autor' => $this->autor,
            'categoria' => $this->whenLoaded('categoria', fn () => $this->categoria ? [
                'id' => $this->categoria->id,
                'nombre' => $this->categoria->nombre,
                'slug' => $this->categoria->slug,
            ] : null),
            'destacado' => (bool) $this->destacado,
            'publicado_at' => $this->publicado_at?->toIso8601String(),
            'minutos_lectura' => $this->minutosLectura(),
            $this->mergeWhen($panel, fn () => [
                'categoria_blog_id' => $this->categoria_blog_id,
                'publicado' => (bool) $this->publicado,
                'estado' => $this->estado(),
            ]),
        ];
    }
}
