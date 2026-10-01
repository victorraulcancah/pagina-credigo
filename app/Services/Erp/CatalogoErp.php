<?php

namespace App\Services\Erp;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Catálogo público leído del ERP (talleres, comercios, cupones, planes).
 *
 * Guarda una copia en caché (services.erp.cache_minutos) y otra de respaldo sin
 * vencimiento: si el ERP no responde se sigue mostrando la última copia buena.
 * Cada catálogo deja pasar solo los campos que la web muestra.
 */
abstract class CatalogoErp
{
    private const VACIO = ['items' => [], 'actualizado' => null];

    // Códigos de departamento del ERP = ubigeo del INEI
    protected const DEPARTAMENTOS = [
        1 => 'Amazonas', 2 => 'Áncash', 3 => 'Apurímac', 4 => 'Arequipa', 5 => 'Ayacucho',
        6 => 'Cajamarca', 7 => 'Callao', 8 => 'Cusco', 9 => 'Huancavelica', 10 => 'Huánuco',
        11 => 'Ica', 12 => 'Junín', 13 => 'La Libertad', 14 => 'Lambayeque', 15 => 'Lima',
        16 => 'Loreto', 17 => 'Madre de Dios', 18 => 'Moquegua', 19 => 'Pasco', 20 => 'Piura',
        21 => 'Puno', 22 => 'San Martín', 23 => 'Tacna', 24 => 'Tumbes', 25 => 'Ucayali',
    ];

    private const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

    public function __construct(protected ClienteErp $erp) {}

    /** Nombre corto del catálogo (clave de caché). */
    abstract protected function clave(): string;

    /** Lista ya filtrada y con solo campos públicos, o null si el ERP no respondió. */
    abstract protected function descargar(): ?array;

    /** Se ejecuta después de una descarga exitosa (ej. actualizar datos vinculados). */
    protected function alSincronizar(array $items): void {}

    /** @return array{items: array, actualizado: ?string} */
    public function catalogo(): array
    {
        if (! $this->erp->configurado()) {
            return self::VACIO;
        }

        return Cache::get($this->claveCache()) ?? $this->sincronizar();
    }

    public function items(): array
    {
        return $this->catalogo()['items'];
    }

    /** Descarga de nuevo. Si el ERP falla, usa el respaldo y reintenta en 5 minutos. */
    public function sincronizar(): array
    {
        $items = $this->erp->configurado() ? $this->descargar() : null;

        if ($items === null) {
            $respaldo = Cache::get($this->claveCache().'.respaldo', self::VACIO);
            Cache::put($this->claveCache(), $respaldo, now()->addMinutes(5));

            return $respaldo;
        }

        $catalogo = ['items' => $items, 'actualizado' => now()->toIso8601String()];
        Cache::put($this->claveCache(), $catalogo, now()->addMinutes(config('services.erp.cache_minutos')));
        Cache::forever($this->claveCache().'.respaldo', $catalogo);
        $this->alSincronizar($items);

        return $catalogo;
    }

    private function claveCache(): string
    {
        return 'erp.catalogo.'.$this->clave();
    }

    // ── Formato común de los datos del ERP ──────────────────

    /** Sedes: departamento, provincia, distrito, dirección y mapa (principal primero). */
    protected function ubicaciones(array $ubicaciones, array $registro): Collection
    {
        // Sin sedes registradas: la dirección principal que trae el listado
        if ($ubicaciones === [] && ! empty($registro['direccion'])) {
            $ubicaciones = [[
                'departamento_id' => $registro['departamento_id'] ?? null,
                'direccion' => $registro['direccion'],
                'google_maps_url' => $registro['google_maps_url'] ?? null,
                'es_principal' => true,
            ]];
        }

        return collect($ubicaciones)
            ->map(fn (array $ubicacion) => [
                'departamento' => $this->departamento($ubicacion['departamento_id'] ?? null, $ubicacion['departamento_nombre'] ?? null),
                'provincia' => $this->nombrePropio($ubicacion['provincia_nombre'] ?? null),
                'distrito' => $this->nombrePropio($ubicacion['distrito_nombre'] ?? null),
                'direccion' => $ubicacion['direccion'] ?? null,
                'mapa_url' => $this->url($ubicacion['google_maps_url'] ?? null),
                'principal' => (bool) ($ubicacion['es_principal'] ?? false),
            ])
            ->sortByDesc('principal')
            ->values();
    }

    protected function departamento(mixed $id, ?string $nombre = null): ?string
    {
        return self::DEPARTAMENTOS[(int) $id] ?? $this->nombrePropio($nombre);
    }

    /** { lunes: { apertura, cierre, cerrado }, ... } o null si no tiene el formato esperado. */
    protected function horario(mixed $horario): ?array
    {
        if (is_string($horario)) {
            $horario = json_decode($horario, true);
        }

        if (! is_array($horario)) {
            return null;
        }

        $dias = collect(self::DIAS)
            ->filter(fn ($dia) => is_array($horario[$dia] ?? null))
            ->mapWithKeys(fn ($dia) => [$dia => [
                'apertura' => $horario[$dia]['apertura'] ?? null,
                'cierre' => $horario[$dia]['cierre'] ?? null,
                'cerrado' => (bool) ($horario[$dia]['cerrado'] ?? false),
            ]]);

        return $dias->isEmpty() ? null : $dias->all();
    }

    /** Solo enlaces http(s): nunca javascript: ni otros esquemas. */
    protected function url(?string $url): ?string
    {
        return $url && preg_match('#^https?://#i', $url) ? $url : null;
    }

    protected function nombrePropio(?string $texto): ?string
    {
        return $texto ? mb_convert_case(mb_strtolower(trim($texto)), MB_CASE_TITLE) : null;
    }

    protected function nombre(array $registro): string
    {
        return trim($registro['nombre_comercial'] ?? '') ?: trim($registro['razon_social'] ?? '');
    }
}
