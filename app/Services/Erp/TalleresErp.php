<?php

namespace App\Services\Erp;

/**
 * Talleres aliados (GET /api/app/talleres-list y su detalle).
 * Nunca pasan RUC, correo, teléfono, datos bancarios, tasas ni enlaces a contratos.
 */
class TalleresErp extends CatalogoErp
{
    protected function clave(): string
    {
        return 'talleres';
    }

    protected function descargar(): ?array
    {
        $lista = $this->erp->get('/api/app/talleres-list');

        if ($lista === null) {
            return null;
        }

        return collect($lista)
            ->filter(fn ($taller) => isset($taller['id']) && ($taller['activo'] ?? true))
            ->map(fn (array $taller) => $this->taller($taller, $this->erp->get("/api/app/talleres-list/servicios/{$taller['id']}")))
            ->sortBy('nombre', SORT_NATURAL | SORT_FLAG_CASE)
            ->values()
            ->all();
    }

    private function taller(array $taller, ?array $detalle): array
    {
        $origen = $detalle ?? $taller;
        $ubicaciones = $this->ubicaciones($origen['ubicaciones'] ?? [], $taller);

        return [
            'id' => (int) $taller['id'],
            'nombre' => $this->nombre($taller),
            'logo_url' => $this->erp->archivo($taller['logo'] ?? null),
            'descripcion' => $origen['descripcion'] ?? null,
            'nota' => $origen['nota_importante'] ?? null,
            'horario' => $this->horario($origen['horario_atencion'] ?? null),
            'whatsapp_url' => $this->url($origen['whatsapp_url'] ?? null),
            'calificacion' => isset($taller['promedio_calificacion']) ? round((float) $taller['promedio_calificacion'], 1) : null,
            'resenas' => (int) ($taller['total_calificaciones'] ?? 0),
            'ubicaciones' => $ubicaciones->all(),
            'ciudades' => $ubicaciones->pluck('departamento')->filter()->unique()->values()->all(),
            'servicios' => collect($detalle['servicios'] ?? [])
                ->filter(fn ($servicio) => ($servicio['disponible'] ?? true) !== false)
                ->map(fn (array $servicio) => $this->servicio($servicio))
                ->values()
                ->all(),
        ];
    }

    private function servicio(array $servicio): array
    {
        $financiamiento = $servicio['detalle_financiamiento'] ?? [];
        $fijo = $financiamiento['fijo'] ?? null;

        return [
            'id' => (int) $servicio['id'],
            'nombre' => trim($servicio['nombre'] ?? ''),
            'descripcion' => $servicio['descripcion'] ?? null,
            'imagen_url' => $this->erp->archivo($servicio['imagen'] ?? null),
            'vehiculo' => $servicio['tipo_vehicular'] ?? null,
            'moneda' => rtrim($financiamiento['moneda'] ?? 'S/', '.'),
            'inicial_porcentaje' => $financiamiento['porcentaje_inicial_default'] ?? null,
            'cuotas_min' => $financiamiento['min_cuotas'] ?? null,
            'cuotas_max' => $financiamiento['max_cuotas'] ?? null,
            'frecuencia' => $financiamiento['frecuencia_pago_default'] ?? $financiamiento['frecuencia_pago'] ?? null,
            // Precio cerrado (modo "fijo"): inicial + N cuotas de la frecuencia indicada
            'precio' => $fijo ? [
                'inicial' => (float) ($fijo['cuota_inicial'] ?? 0),
                'cuota' => (float) ($fijo['cuota_mensual'] ?? 0),
                'cuotas' => (int) ($fijo['cantidad_cuotas'] ?? 0),
                'total' => (float) ($fijo['monto_total_estimado'] ?? 0),
            ] : null,
        ];
    }
}
