<?php

namespace App\Services\Erp;

use Illuminate\Support\Carbon;

/**
 * Cupones PÚBLICOS vigentes (GET /api/app/promociones/cupones/listar sin cliente).
 * Nunca se envía un cliente: así el ERP solo devuelve los públicos y ningún dato personal.
 */
class CuponesErp extends CatalogoErp
{
    protected function clave(): string
    {
        return 'cupones';
    }

    /** Los vigentes hoy (la copia puede tener hasta 30 minutos). */
    public function vigentes(): array
    {
        $hoy = now()->toDateString();

        return collect($this->items())
            ->filter(fn ($cupon) => (! $cupon['desde'] || $cupon['desde'] <= $hoy) && (! $cupon['hasta'] || $cupon['hasta'] >= $hoy))
            ->values()
            ->all();
    }

    protected function descargar(): ?array
    {
        $datos = $this->erp->get('/api/app/promociones/cupones/listar');

        if ($datos === null) {
            return null;
        }

        return collect($datos['cupones'] ?? [])
            ->filter(fn ($cupon) => isset($cupon['id'])
                && ($cupon['activo'] ?? true)
                && ($cupon['tipo_cupon'] ?? 'publico') === 'publico')
            ->map(fn (array $cupon) => [
                'id' => (int) $cupon['id'],
                'titulo' => trim($cupon['titulo'] ?? ''),
                'descripcion' => $cupon['descripcion'] ?? null,
                'categoria' => $cupon['categoria'] ?? null,
                'tipo_descuento' => ($cupon['tipo_descuento'] ?? null) === 'monto_fijo' ? 'monto' : 'porcentaje',
                'valor' => isset($cupon['valor']) ? (float) $cupon['valor'] : null,
                'imagen_url' => $this->erp->archivo($cupon['imagen_banner'] ?? null),
                'ciudad' => $this->departamento($cupon['departamento_id'] ?? null),
                'desde' => $this->fecha($cupon['fecha_inicio'] ?? null),
                'hasta' => $this->fecha($cupon['fecha_fin'] ?? null),
            ])
            ->sortBy('hasta')
            ->values()
            ->all();
    }

    /** Fecha del ERP (ISO en UTC) como día de Lima. */
    private function fecha(?string $valor): ?string
    {
        return $valor ? Carbon::parse($valor)->setTimezone('America/Lima')->toDateString() : null;
    }
}
