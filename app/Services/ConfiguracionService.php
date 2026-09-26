<?php

namespace App\Services;

use App\Models\Configuracion;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Ajustes del sitio (empresa, contacto, redes, colores, logo).
 * Valores por defecto en config/sitio.php; lo guardado en BD los reemplaza.
 * Se cachean porque se leen en cada página (se limpian al guardar).
 */
class ConfiguracionService
{
    private const CACHE_KEY = 'sitio.configuracion';

    public function __construct(private ImagenService $imagenes) {}

    public function todas(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, fn () => array_merge(
            config('sitio.defaults'),
            Configuracion::pluck('valor', 'clave')->all(),
        ));
    }

    public function get(string $clave, mixed $default = null): mixed
    {
        return $this->todas()[$clave] ?? $default;
    }

    /** Ajustes que se comparten con el frontend, con URLs públicas de las imágenes. */
    public function publicas(): array
    {
        $ajustes = $this->todas();

        return [
            ...$ajustes,
            'color_primario' => $this->colorSeguro($ajustes['color_primario'], 'color_primario'),
            'color_acento' => $this->colorSeguro($ajustes['color_acento'], 'color_acento'),
            'logo_url' => $this->imagenes->url($ajustes['logo']),
            'favicon_url' => $this->imagenes->url($ajustes['favicon']),
        ];
    }

    /** Guarda solo las claves conocidas (las de config/sitio.php), excepto imágenes. */
    public function actualizar(array $datos): void
    {
        $permitidas = array_diff_key(config('sitio.defaults'), array_flip(config('sitio.imagenes')));
        $datos = array_intersect_key($datos, $permitidas);

        DB::transaction(function () use ($datos) {
            foreach ($datos as $clave => $valor) {
                Configuracion::updateOrCreate(['clave' => $clave], ['valor' => $valor]);
            }
        });

        $this->limpiarCache();
    }

    public function actualizarImagen(string $clave, UploadedFile $archivo): void
    {
        $ruta = $this->imagenes->reemplazar($this->get($clave), $archivo, 'configuracion');
        Configuracion::updateOrCreate(['clave' => $clave], ['valor' => $ruta]);

        $this->limpiarCache();
    }

    public function quitarImagen(string $clave): void
    {
        $this->imagenes->eliminar($this->get($clave));
        Configuracion::updateOrCreate(['clave' => $clave], ['valor' => null]);

        $this->limpiarCache();
    }

    public function limpiarCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /** Los colores se imprimen en CSS: solo se acepta hexadecimal válido. */
    private function colorSeguro(?string $color, string $clave): string
    {
        return preg_match('/^#[0-9a-fA-F]{6}$/', (string) $color) ? $color : config("sitio.defaults.{$clave}");
    }
}
