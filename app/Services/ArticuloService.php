<?php

namespace App\Services;

use App\Models\Articulo;
use App\Models\CategoriaBlog;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Stevebauman\Purify\Facades\Purify;

/** Artículos del blog de la empresa: se escriben en el panel y se leen en /blog. */
class ArticuloService
{
    private const CARPETA = 'blog';

    // Hasta cuántos artículos trae la página /blog (el más nuevo destacado + la grilla)
    public const MAXIMO_LISTA = 60;

    public function __construct(private ImagenService $imagenes) {}

    /** Todos (borradores, programados y publicados) para el panel, los más nuevos primero. */
    public function listar(): Collection
    {
        return Articulo::with('categoria:id,nombre,slug')
            ->orderByRaw('publicado_at IS NULL DESC')
            ->recientes()
            ->get();
    }

    /** Los que se ven en el sitio (todos o los de una categoría), del más nuevo al más antiguo. */
    public function visibles(?CategoriaBlog $categoria = null, int $limite = self::MAXIMO_LISTA): Collection
    {
        return Articulo::visible()
            ->with('categoria:id,nombre,slug')
            ->when($categoria, fn ($q) => $q->where('categoria_blog_id', $categoria->id))
            ->recientes()
            ->limit($limite)
            ->get();
    }

    /** Un artículo visible por su dirección (null si no existe, es borrador o aún no llega su fecha). */
    public function visiblePorSlug(string $slug): ?Articulo
    {
        return Articulo::visible()->with('categoria:id,nombre,slug')->where('slug', $slug)->first();
    }

    /** Para leer después: primero los de su misma categoría, luego los más nuevos. */
    public function relacionados(Articulo $articulo, int $cantidad = 3): Collection
    {
        return Articulo::visible()
            ->with('categoria:id,nombre,slug')
            ->whereKeyNot($articulo->id)
            ->orderByRaw('CASE WHEN categoria_blog_id = ? THEN 0 ELSE 1 END', [$articulo->categoria_blog_id ?? 0])
            ->recientes()
            ->limit($cantidad)
            ->get();
    }

    public function crear(array $datos): Articulo
    {
        return Articulo::create($this->conPortada($this->contenidoLimpio($datos)))->load('categoria:id,nombre,slug');
    }

    public function actualizar(Articulo $articulo, array $datos): Articulo
    {
        $anteriores = $this->imagenesDelArticulo($articulo);
        $articulo->update($this->conPortada($this->contenidoLimpio($datos), $articulo));
        $articulo->refresh();

        // Las fotos que ya no están en ningún bloque se borran del disco
        foreach (array_diff($anteriores, $this->imagenesDelArticulo($articulo)) as $ruta) {
            $this->imagenes->eliminar($ruta);
        }

        return $articulo->load('categoria:id,nombre,slug');
    }

    /** Borra el artículo con su portada y las imágenes que se subieron para su contenido. */
    public function eliminar(Articulo $articulo): void
    {
        $this->imagenes->eliminar($articulo->portada);

        foreach ($this->imagenesDelArticulo($articulo) as $ruta) {
            $this->imagenes->eliminar($ruta);
        }

        $articulo->delete();
    }

    /** Imagen para el contenido ("Insertar imagen" del editor): devuelve su dirección pública. */
    public function subirImagen(UploadedFile $archivo): string
    {
        return $this->imagenes->url($this->imagenes->guardar($archivo, self::CARPETA.'/contenido'));
    }

    /** Rutas en el disco de las imágenes subidas que usa el artículo (en su texto o en sus bloques). */
    private function imagenesDelArticulo(Articulo $articulo): array
    {
        $texto = $articulo->contenido.' '.json_encode($articulo->bloques ?? [], JSON_UNESCAPED_SLASHES);
        preg_match_all('#/storage/('.self::CARPETA.'/contenido/[^)\s"\'<>]+)#', $texto, $coincidencias);

        return array_values(array_unique($coincidencias[1]));
    }

    /**
     * El HTML del editor se limpia al guardar: solo queda el formato permitido (config/purify.php → articulo).
     * Con bloques, cada uno se normaliza y `contenido` pasa a ser el texto de los bloques de texto.
     */
    private function contenidoLimpio(array $datos): array
    {
        if (isset($datos['bloques']) && is_array($datos['bloques'])) {
            $bloques = $this->bloquesLimpios($datos['bloques']);
            $datos['bloques'] = $bloques ?: null;
            $datos['contenido'] = collect($bloques)->where('tipo', 'texto')->pluck('html')->implode('');
        } elseif (array_key_exists('contenido', $datos)) {
            // Texto suelto (artículos anteriores o la API): reemplaza a los bloques que hubiera
            $datos['bloques'] = null;
            if (Articulo::esHtml($datos['contenido'])) {
                $datos['contenido'] = Purify::config('articulo')->clean($datos['contenido']);
            }
        }

        return $datos;
    }

    /** Solo lo permitido de cada bloque, con sus valores por defecto; los bloques de texto vacíos se descartan. */
    private function bloquesLimpios(array $bloques): array
    {
        return collect($bloques)->map(function (array $bloque) {
            if (($bloque['tipo'] ?? null) === 'fotos') {
                $fotos = collect($bloque['fotos'] ?? [])
                    ->map(fn ($foto) => ['src' => (string) $foto['src'], 'alt' => trim(strip_tags((string) ($foto['alt'] ?? '')))])
                    ->values()->all();

                if (! $fotos) {
                    return null;
                }

                $varias = count($fotos) > 1;

                return [
                    'tipo' => 'fotos',
                    'fotos' => $fotos,
                    'diseno' => $bloque['diseno'] ?? ($varias ? 'galeria' : 'unica'),
                    'columnas' => (int) ($bloque['columnas'] ?? min(count($fotos), 3)),
                    'tamano' => $bloque['tamano'] ?? Articulo::TAMANOS[0],
                    'alineacion' => $bloque['alineacion'] ?? Articulo::ALINEACIONES[0],
                    'proporcion' => $bloque['proporcion'] ?? ($varias ? 'horizontal' : 'original'),
                    'animacion' => $bloque['animacion'] ?? Articulo::ANIMACIONES[0],
                ];
            }

            $html = Purify::config('articulo')->clean((string) ($bloque['html'] ?? ''));

            return trim(strip_tags($html)) === '' ? null : ['tipo' => 'texto', 'html' => $html];
        })->filter()->values()->all();
    }

    private function conPortada(array $datos, ?Articulo $articulo = null): array
    {
        return [
            ...collect($datos)->except(['portada', 'quitar_portada'])->all(),
            ...$this->imagenes->resolver($datos, $articulo?->portada, self::CARPETA, 'portada'),
        ];
    }
}
