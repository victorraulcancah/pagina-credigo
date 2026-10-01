<?php

namespace App\Services\Erp;

/**
 * Comercios GO (GET /api/app/comercios-list).
 * Nunca pasan RUC/DNI, razón social, correo ni teléfonos (solo el enlace de WhatsApp).
 */
class ComerciosErp extends CatalogoErp
{
    protected function clave(): string
    {
        return 'comercios';
    }

    protected function descargar(): ?array
    {
        $lista = $this->erp->get('/api/app/comercios-list');

        if ($lista === null) {
            return null;
        }

        return collect($lista)
            ->filter(fn ($comercio) => isset($comercio['id']) && ($comercio['activo'] ?? true))
            ->map(function (array $comercio) {
                $ubicaciones = $this->ubicaciones($comercio['ubicaciones'] ?? [], $comercio);

                return [
                    'id' => (int) $comercio['id'],
                    'nombre' => $this->nombre($comercio),
                    'logo_url' => $this->erp->archivo($comercio['logo'] ?? null),
                    'categoria' => isset($comercio['categoria']['nombre']) ? [
                        'nombre' => $comercio['categoria']['nombre'],
                        'icono' => $comercio['categoria']['icono'] ?? null,
                    ] : null,
                    'descripcion' => $comercio['descripcion'] ?? null,
                    'nota' => $comercio['nota_importante'] ?? null,
                    'horario' => $this->horario($comercio['horario_atencion'] ?? null),
                    'whatsapp_url' => $this->url($comercio['whatsapp_url'] ?? null),
                    'ubicaciones' => $ubicaciones->all(),
                    'ciudades' => $ubicaciones->pluck('departamento')->filter()->unique()->values()->all(),
                ];
            })
            ->sortBy('nombre', SORT_NATURAL | SORT_FLAG_CASE)
            ->values()
            ->all();
    }
}
