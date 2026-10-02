<?php

namespace App\Models;

use App\Models\Concerns\Ordenable;
use App\Services\ImagenService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** PDF descargable de la web. La categoría decide en qué página se muestra. */
class Documento extends Model
{
    use Ordenable;

    /** categoría => [nombre en el panel, página donde se muestra] */
    public const CATEGORIAS = [
        'requisitos' => ['Requisitos', '/requisitos'],
        'planes' => ['Planes (fichas)', '/servicios'],
        'pagos' => ['Cómo pagar', '/como-pagar'],
        'talleres' => ['Talleres aliados', '/talleres'],
        'legal' => ['Legal', '/terminos-y-condiciones'],
    ];

    protected $table = 'documentos';

    protected $fillable = ['titulo', 'descripcion', 'categoria', 'servicio_id', 'archivo', 'tamano', 'orden', 'activo'];

    protected $hidden = ['archivo'];

    protected $appends = ['archivo_url'];

    protected function casts(): array
    {
        return [
            'servicio_id' => 'integer',
            'tamano' => 'integer',
            'orden' => 'integer',
            'activo' => 'boolean',
        ];
    }

    public function servicio(): BelongsTo
    {
        return $this->belongsTo(Servicio::class);
    }

    public function scopeCategoria(Builder $query, string $categoria): Builder
    {
        return $query->where('categoria', $categoria);
    }

    /** Lo que ve la web: visibles de una categoría, en orden. */
    public static function publicos(string $categoria)
    {
        return static::activo()->categoria($categoria)->ordenado()
            ->get(['id', 'titulo', 'descripcion', 'servicio_id', 'archivo', 'tamano']);
    }

    protected function archivoUrl(): Attribute
    {
        return Attribute::get(fn () => app(ImagenService::class)->url($this->archivo));
    }
}
