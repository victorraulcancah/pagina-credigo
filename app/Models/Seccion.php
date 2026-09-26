<?php

namespace App\Models;

use App\Models\Concerns\Ordenable;
use App\Models\Concerns\TieneImagen;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Seccion extends Model
{
    use Ordenable, TieneImagen;

    protected $table = 'secciones';

    protected $fillable = [
        'pagina', 'clave', 'nombre', 'subtitulo', 'titulo', 'contenido', 'imagen',
        'boton_texto', 'boton_url', 'items', 'campos', 'orden', 'activo',
    ];

    protected function casts(): array
    {
        return [
            'items' => 'array',
            'campos' => 'array',
            'orden' => 'integer',
            'activo' => 'boolean',
        ];
    }

    public function scopePorPagina(Builder $query, array $paginas): Builder
    {
        return $query->whereIn('pagina', $paginas);
    }

    public function usaCampo(string $campo): bool
    {
        return in_array($campo, $this->campos ?? [], true);
    }
}
