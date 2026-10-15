<?php

namespace App\Services;

use App\Models\CategoriaBlog;
use Illuminate\Database\Eloquent\Collection;

/** Las 3 categorías fijas del blog: Eventos, Noticias y Tendencias. */
class CategoriaBlogService
{
    public function todas(): Collection
    {
        return CategoriaBlog::orderBy('orden')->get(['id', 'nombre', 'slug']);
    }

    public function porSlug(string $slug): ?CategoriaBlog
    {
        return CategoriaBlog::where('slug', $slug)->first(['id', 'nombre', 'slug']);
    }
}
