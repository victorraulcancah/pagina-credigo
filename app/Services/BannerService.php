<?php

namespace App\Services;

use App\Models\Banner;
use Illuminate\Database\Eloquent\Collection;

/** Banners del carrusel del inicio, con su imagen de escritorio y la de celular. */
class BannerService
{
    private const CARPETA = 'banners';

    private const CAMPOS_ARCHIVO = ['imagen', 'quitar_imagen', 'imagen_movil', 'quitar_imagen_movil'];

    public function __construct(private ImagenService $imagenes) {}

    public function listar(): Collection
    {
        return Banner::ordenado()->get();
    }

    /** Los que se ven en el sitio, en orden. */
    public function activos(): Collection
    {
        return Banner::activo()->ordenado()->get();
    }

    public function crear(array $datos): Banner
    {
        return Banner::create($this->conImagenes($datos));
    }

    public function actualizar(Banner $banner, array $datos): Banner
    {
        $banner->update($this->conImagenes($datos, $banner));

        return $banner->refresh();
    }

    public function eliminar(Banner $banner): void
    {
        $this->imagenes->eliminar($banner->imagen);
        $this->imagenes->eliminar($banner->imagen_movil);
        $banner->delete();
    }

    /** Datos del formulario + las dos imágenes (escritorio y celular). */
    private function conImagenes(array $datos, ?Banner $banner = null): array
    {
        return [
            ...collect($datos)->except(self::CAMPOS_ARCHIVO)->all(),
            ...$this->imagenes->resolver($datos, $banner?->imagen, self::CARPETA),
            ...$this->imagenes->resolver($datos, $banner?->imagen_movil, self::CARPETA, 'imagen_movil'),
        ];
    }
}
