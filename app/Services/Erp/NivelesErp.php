<?php

namespace App\Services\Erp;

/**
 * Niveles de fidelización del ERP (GET /api/app/niveles-fidelizacion): Pollito, Bronce, Plata, Oro...
 * Dejan pasar solo lo que la web muestra: nombre, imagen, cuántos financiamientos pide cada nivel y su % de inicial.
 */
class NivelesErp extends CatalogoErp
{
    protected function clave(): string
    {
        return 'niveles';
    }

    protected function descargar(): ?array
    {
        $lista = $this->erp->get('/api/app/niveles-fidelizacion');

        if ($lista === null) {
            return null;
        }

        return collect($lista)
            ->filter(fn ($nivel) => ! empty($nivel['codigo']) && ! empty($nivel['nombre']) && ($nivel['activo'] ?? true))
            ->map(fn (array $nivel) => [
                'codigo' => (string) $nivel['codigo'],
                'nombre' => trim($nivel['nombre']),
                'imagen_url' => $this->erp->archivo($nivel['imagen'] ?? null),
                'financiamientos_requeridos' => (int) ($nivel['financiamientos_requeridos'] ?? 0),
                'porcentajes' => collect($nivel['porcentajes'] ?? [])->only(['taller', 'celular'])->map(fn ($valor) => (float) $valor)->all(),
            ])
            ->sortBy('financiamientos_requeridos')
            ->values()
            ->all();
    }
}
