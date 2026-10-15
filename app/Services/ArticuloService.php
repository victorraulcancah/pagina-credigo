<?php

namespace App\Services;

use App\Models\Articulo;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

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

    /** Los que se ven en el sitio, del más nuevo al más antiguo. */
    public function visibles(int $limite = self::MAXIMO_LISTA): Collection
    {
        return Articulo::visible()->with('categoria:id,nombre,slug')->recientes()->limit($limite)->get();
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
        return Articulo::create($this->conPortada($datos))->load('categoria:id,nombre,slug');
    }

    public function actualizar(Articulo $articulo, array $datos): Articulo
    {
        $articulo->update($this->conPortada($datos, $articulo));

        return $articulo->refresh()->load('categoria:id,nombre,slug');
    }

    /** Borra el artículo con su portada y las imágenes que se subieron para su contenido. */
    public function eliminar(Articulo $articulo): void
    {
        $this->imagenes->eliminar($articulo->portada);

        foreach ($this->imagenesDelContenido($articulo->contenido) as $ruta) {
            $this->imagenes->eliminar($ruta);
        }

        $articulo->delete();
    }

    /** Imagen para el contenido ("Insertar imagen" del editor): devuelve su dirección pública. */
    public function subirImagen(UploadedFile $archivo): string
    {
        return $this->imagenes->url($this->imagenes->guardar($archivo, self::CARPETA.'/contenido'));
    }

    /** Rutas en el disco de las imágenes subidas que usa el contenido. */
    private function imagenesDelContenido(?string $contenido): array
    {
        preg_match_all('#/storage/('.self::CARPETA.'/contenido/[^)\s]+)#', (string) $contenido, $coincidencias);

        return array_unique($coincidencias[1]);
    }

    private function conPortada(array $datos, ?Articulo $articulo = null): array
    {
        return [
            ...collect($datos)->except(['portada', 'quitar_portada'])->all(),
            ...$this->imagenes->resolver($datos, $articulo?->portada, self::CARPETA, 'portada'),
        ];
    }
}
