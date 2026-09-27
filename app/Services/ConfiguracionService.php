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
        // Solo se cachea lo guardado en BD; los valores por defecto se combinan siempre,
        // así una clave nueva en config/sitio.php funciona sin limpiar la caché.
        return array_merge(
            config('sitio.defaults'),
            Cache::rememberForever(self::CACHE_KEY, fn () => Configuracion::pluck('valor', 'clave')->all()),
        );
    }

    public function get(string $clave, mixed $default = null): mixed
    {
        return $this->todas()[$clave] ?? $default;
    }

    /**
     * Ajustes que se comparten con el sitio público, con URLs de las imágenes.
     * No incluye las claves privadas (ej. correos internos de avisos).
     */
    public function publicas(): array
    {
        return array_diff_key($this->paraPanel(), array_flip(config('sitio.privadas')));
    }

    /** Todos los ajustes (incluidos los privados) para las pantallas de configuración del panel. */
    public function paraPanel(): array
    {
        $ajustes = $this->todas();

        return [
            ...$ajustes,
            'color_primario' => $this->colorSeguro($ajustes['color_primario'], 'color_primario'),
            'color_acento' => $this->colorSeguro($ajustes['color_acento'], 'color_acento'),
            'analytics_ga4' => $this->idSeguro($ajustes['analytics_ga4'], '/^G-[A-Z0-9]{4,20}$/'),
            'analytics_meta_pixel' => $this->idSeguro($ajustes['analytics_meta_pixel'], '/^\d{10,20}$/'),
            'logo_url' => $this->imagenes->url($ajustes['logo']),
            'favicon_url' => $this->imagenes->url($ajustes['favicon']),
            'imagen_compartir_url' => $this->imagenes->url($ajustes['imagen_compartir']),
        ];
    }

    /**
     * Correos del equipo que reciben los avisos (solicitudes, reclamaciones).
     * Si no se configuró ninguno, se usa el correo de contacto de la empresa.
     *
     * @return string[]
     */
    public function correosInternos(): array
    {
        $lista = preg_split('/[\s,;]+/', (string) $this->get('notificaciones_email'), -1, PREG_SPLIT_NO_EMPTY);
        $validos = array_values(array_filter($lista, fn ($correo) => filter_var($correo, FILTER_VALIDATE_EMAIL)));

        return $validos ?: array_filter([$this->get('contacto_email')]);
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

    /** Los IDs de analítica se imprimen dentro de un <script>: solo se acepta el formato esperado. */
    private function idSeguro(?string $valor, string $patron): string
    {
        return preg_match($patron, (string) $valor) ? $valor : '';
    }

    /** Los colores se imprimen en CSS: solo se acepta hexadecimal válido. */
    private function colorSeguro(?string $color, string $clave): string
    {
        return preg_match('/^#[0-9a-fA-F]{6}$/', (string) $color) ? $color : config("sitio.defaults.{$clave}");
    }
}
