<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/** Categoría del blog (Noticias, Consejos, Novedades…). */
class CategoriaBlog extends Model
{
    protected $table = 'categorias_blog';

    protected $fillable = ['nombre', 'slug', 'orden'];

    protected function casts(): array
    {
        return ['orden' => 'integer'];
    }

    /** La dirección se arma con el nombre ("Consejos de manejo" → consejos-de-manejo). */
    protected static function booted(): void
    {
        static::saving(function (CategoriaBlog $categoria) {
            if (blank($categoria->slug) || $categoria->isDirty('nombre')) {
                $base = Str::slug($categoria->nombre) ?: 'categoria';
                $slug = $base;
                for ($i = 2; static::where('slug', $slug)->whereKeyNot($categoria->id)->exists(); $i++) {
                    $slug = "{$base}-{$i}";
                }
                $categoria->slug = $slug;
            }
        });
    }

    public function articulos(): HasMany
    {
        return $this->hasMany(Articulo::class);
    }
}
