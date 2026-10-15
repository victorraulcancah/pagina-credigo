<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Categoría del blog. Son 3 fijas (Eventos, Noticias y Tendencias, las crea la migración):
 * el menú y las direcciones (/blog/eventos…) dependen de ellas, por eso no se editan en el panel.
 */
class CategoriaBlog extends Model
{
    protected $table = 'categorias_blog';

    protected $fillable = ['nombre', 'slug', 'orden'];

    protected function casts(): array
    {
        return ['orden' => 'integer'];
    }

    public function articulos(): HasMany
    {
        return $this->hasMany(Articulo::class);
    }

    /** Página pública de la categoría. */
    public function url(): string
    {
        return "/blog/{$this->slug}";
    }
}
