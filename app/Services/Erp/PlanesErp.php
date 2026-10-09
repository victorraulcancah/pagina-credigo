<?php

namespace App\Services\Erp;

use App\Models\OpcionPlan;
use Illuminate\Support\Arr;

/**
 * Precios de los planes del ERP (GET /api/app/promociones/beneficios?tipo=1) para el cotizador.
 *
 * Cada variante (o el beneficio, si no tiene variantes) se convierte en una opción con los
 * mismos campos que OpcionPlan. Las opciones del cotizador vinculadas (erp_ref) se actualizan
 * solas en cada sincronización. Nunca pasan tasas, comisiones ni datos internos del grupo.
 */
class PlanesErp extends CatalogoErp
{
    private const FRECUENCIAS = [1 => 'semanal', 2 => 'quincenal', 3 => 'mensual'];

    protected function clave(): string
    {
        return 'planes';
    }

    /** Opción del ERP por su referencia ("v7" = variante 7, "b12" = beneficio 12). */
    public function opcion(string $ref): ?array
    {
        return collect($this->items())->flatMap(fn ($plan) => $plan['opciones'])->firstWhere('ref', $ref);
    }

    protected function descargar(): ?array
    {
        $lista = $this->erp->get('/api/app/promociones/beneficios', ['tipo' => 1]);

        if ($lista === null) {
            return null;
        }

        return collect($lista)
            ->filter(fn ($beneficio) => isset($beneficio['id']) && ($beneficio['disponible'] ?? true))
            ->map(fn (array $beneficio) => [
                'id' => (int) $beneficio['id'],
                'nombre' => trim($beneficio['nombre'] ?? ''),
                'categoria' => $beneficio['categoria_nombre'] ?? null,
                'opciones' => $this->opciones($beneficio),
            ])
            ->filter(fn ($plan) => $plan['opciones'] !== [])
            ->sortBy([['categoria', 'asc'], ['nombre', 'asc']])
            ->values()
            ->all();
    }

    private function opciones(array $beneficio): array
    {
        $variantes = $beneficio['variantes_disponibles'] ?? [];

        if ($variantes !== []) {
            return collect($variantes)
                ->filter(fn ($variante) => isset($variante['variante_id']))
                ->map(fn (array $variante) => $this->opcionPlan(
                    ref: 'v'.$variante['variante_id'],
                    nombre: trim($variante['nombre'] ?? '') ?: $beneficio['nombre'],
                    moneda: (int) ($variante['moneda_id'] ?? 1),
                    monedaInicial: (int) ($variante['moneda_inicial_id'] ?? $variante['moneda_id'] ?? 1),
                    inicial: (float) ($variante['cuota_inicial'] ?? 0),
                    inscripcion: (float) ($variante['monto_inscripcion'] ?? 0),
                    cuota: (float) ($variante['monto_cuota'] ?? 0),
                    cuotas: (int) ($variante['cantidad_cuotas'] ?? 0),
                    frecuencia: self::FRECUENCIAS[(int) ($variante['frecuencia_pago_id'] ?? 0)] ?? null,
                    certificado: $variante['certificado'] ?? null,
                ))
                ->values()
                ->all();
        }

        // Sin variantes: el precio está en el propio beneficio
        $moneda = ($beneficio['moneda'] ?? 'S/.') === '$' ? 2 : 1;
        $frecuencia = $beneficio['frecuencia_pago'] ?? null;

        return [$this->opcionPlan(
            ref: 'b'.$beneficio['id'],
            nombre: trim($beneficio['nombre'] ?? ''),
            moneda: $moneda,
            monedaInicial: $moneda,
            inicial: (float) ($beneficio['cuota_inicial'] ?? 0),
            inscripcion: (float) ($beneficio['pago_inscripcion'] ?? 0),
            cuota: (float) ($beneficio['cuota_mensual'] ?? 0),
            cuotas: (int) ($beneficio['cantidad_cuotas'] ?? 0),
            frecuencia: in_array($frecuencia, self::FRECUENCIAS, true) ? $frecuencia : null,
            certificado: null,
        )];
    }

    /** Opción con los campos de OpcionPlan (+ ref, sugerencia de nota y si se puede importar). */
    private function opcionPlan(
        string $ref, string $nombre, int $moneda, int $monedaInicial, float $inicial,
        float $inscripcion, float $cuota, int $cuotas, ?string $frecuencia, mixed $certificado,
    ): array {
        $codigo = $moneda === 2 ? 'USD' : 'PEN';
        $codigoInicial = $monedaInicial === 2 ? 'USD' : 'PEN';
        $montoInicial = $inicial > 0 ? $inicial : ($inscripcion > 0 ? $inscripcion : null);

        // La inicial va en su propia moneda (puede ser US$ con cuotas en S/)
        $nota = collect([
            $certificado ? 'Certificado de '.number_format((float) $certificado, 0, '.', ',') : null,
            $inicial > 0 && $inscripcion > 0 ? 'Inscripción '.$this->monto($inscripcion, $codigoInicial) : null,
        ])->filter()->implode(' · ');

        return [
            'ref' => $ref,
            'nombre' => mb_substr($nombre, 0, 120),
            'nota' => $nota ?: null,
            'moneda' => $codigo,
            'moneda_inicial' => $codigoInicial,
            'inicial' => $montoInicial,
            'cuota' => $cuota > 0 ? $cuota : null,
            'numero_cuotas' => $cuotas > 0 ? $cuotas : null,
            'frecuencia' => $frecuencia,
            // El cotizador solo maneja cuotas semanales, quincenales o mensuales
            'importable' => $frecuencia !== null,
        ];
    }

    private function monto(float $valor, string $moneda): string
    {
        $decimales = $valor == floor($valor) ? 0 : 2;

        return ($moneda === 'USD' ? 'US$ ' : 'S/ ').number_format($valor, $decimales, '.', ',');
    }

    /** Actualiza los montos de las opciones del cotizador vinculadas al ERP (no toca nombre ni nota). */
    protected function alSincronizar(array $items): void
    {
        $precios = collect($items)->flatMap(fn ($plan) => $plan['opciones'])->keyBy('ref');

        OpcionPlan::whereNotNull('erp_ref')->each(function (OpcionPlan $opcion) use ($precios) {
            $precio = $precios->get($opcion->erp_ref);

            if ($precio && $precio['importable']) {
                $opcion->update(Arr::only($precio, ['moneda', 'moneda_inicial', 'inicial', 'cuota', 'numero_cuotas', 'frecuencia']));
            }
        });
    }
}
