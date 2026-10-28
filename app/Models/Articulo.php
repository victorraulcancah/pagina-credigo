<?php

namespace App\Models;

use App\Services\ImagenService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * Artículo del blog de la empresa. Se ve en el sitio cuando está publicado y su fecha ya
 * llegó; con fecha futura queda programado y aparece solo ese día.
 */
class Articulo extends Model
{
    // Palabras por minuto para calcular el tiempo de lectura
    private const PALABRAS_POR_MINUTO = 200;

    protected $table = 'articulos';

    // Opciones de los bloques de fotos del artículo (la primera de cada lista es la de por defecto)
    public const DISENOS = ['galeria', 'unica', 'carrusel'];

    public const TAMANOS = ['grande', 'mediana', 'pequena', 'completo'];

    public const ALINEACIONES = ['centro', 'izquierda', 'derecha'];

    public const PROPORCIONES = ['horizontal', 'original', 'cuadrada', 'vertical'];

    public const ANIMACIONES = ['zoom', 'abajo', 'izquierda', 'derecha', 'ninguna'];

    protected $fillable = [
        'categoria_blog_id', 'titulo', 'slug', 'resumen', 'contenido', 'bloques', 'portada',
        'video_url', 'autor', 'publicado', 'destacado', 'publicado_at',
    ];

    protected $appends = ['portada_url'];

    protected function casts(): array
    {
        return [
            'bloques' => 'array',
            'publicado' => 'boolean',
            'destacado' => 'boolean',
            'publicado_at' => 'datetime',
        ];
    }

    /** Sin dirección escrita en el panel, se arma con el título. Al publicar sin fecha, la fecha es hoy. */
    protected static function booted(): void
    {
        static::saving(function (Articulo $articulo) {
            if (blank($articulo->slug)) {
                $articulo->slug = static::slugLibre($articulo->titulo, $articulo->id);
            }

            if ($articulo->publicado && ! $articulo->publicado_at) {
                $articulo->publicado_at = now();
            }
        });
    }

    /** Dirección que no use otro artículo: "como-pagar-tu-cuota", "como-pagar-tu-cuota-2"... */
    public static function slugLibre(string $titulo, ?int $ignorarId = null): string
    {
        $base = Str::limit(Str::slug($titulo), 150, '') ?: 'articulo';
        $slug = $base;
        for ($i = 2; static::where('slug', $slug)->when($ignorarId, fn ($q) => $q->whereKeyNot($ignorarId))->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaBlog::class, 'categoria_blog_id');
    }

    /** Los que se ven en el sitio: publicados y con su fecha ya cumplida. */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('publicado', true)->where('publicado_at', '<=', now());
    }

    /** Del más nuevo al más antiguo. */
    public function scopeRecientes(Builder $query): Builder
    {
        return $query->orderByDesc('publicado_at')->orderByDesc('id');
    }

    /** borrador · programado (publicado con fecha futura) · publicado */
    public function estado(): string
    {
        if (! $this->publicado) {
            return 'borrador';
        }

        return $this->publicado_at?->isFuture() ? 'programado' : 'publicado';
    }

    /**
     * El contenido nuevo lo escribe el editor del panel (HTML limpio); los artículos anteriores
     * guardan texto simple ("## subtítulo", "![pie](dirección)") y se siguen mostrando igual.
     */
    public static function esHtml(?string $contenido): bool
    {
        return str_starts_with(ltrim((string) $contenido), '<');
    }

    /** Minutos de lectura aproximados (mínimo 1). */
    public function minutosLectura(): int
    {
        // Sin contar las imágenes ni las etiquetas; se separa por espacios (str_word_count corta las palabras con tilde)
        $texto = static::esHtml($this->contenido)
            ? html_entity_decode(preg_replace('/<[^>]*>/', ' ', (string) $this->contenido))
            : preg_replace('/!\[[^\]]*\]\([^)]*\)/', '', (string) $this->contenido);
        $texto = trim($texto);
        $palabras = $texto === '' ? 0 : count(preg_split('/\s+/u', $texto));

        return max(1, (int) ceil($palabras / self::PALABRAS_POR_MINUTO));
    }

    /** Página pública del artículo, dentro de su categoría (/blog/noticias/{slug}). */
    public function url(): string
    {
        return "/blog/{$this->categoria?->slug}/{$this->slug}";
    }

    protected function portadaUrl(): Attribute
    {
        return Attribute::get(fn () => app(ImagenService::class)->url($this->portada));
    }
}
