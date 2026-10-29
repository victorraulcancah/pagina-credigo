<?php

namespace App\Services\Erp;

/**
 * Niveles de fidelización del ERP (GET /api/app/niveles-fidelizacion): Pollito, Bronce, Plata, Oro...
 * Dejan pasar solo lo que la web muestra: nombre, imagen, cuántos financiamientos pide cada nivel y su % de inicial.
 */
class NivelesErp extends CatalogoErp
{
    /**
     * Imágenes que trae el propio ERP para sus cuatro niveles de siempre. La API manda `imagen: null` mientras nadie suba una desde
     * el panel (el ERP y el app dibujan entonces esta, por el código del nivel), así que la web hace igual. Una imagen subida manda.
     */
    private const IMAGENES_DEL_SISTEMA = [
        'pollito' => 'images/niveles/nivel-pollito.webp',
        'bronce' => 'images/icons/nivel-bronce.svg',
        'plata' => 'images/icons/nivel-plata.svg',
        'oro' => 'images/icons/nivel-oro.svg',
    ];

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
                'imagen_url' => $this->erp->archivo($nivel['imagen'] ?? null) ?? $this->imagenDelSistema($nivel['codigo']),
                'financiamientos_requeridos' => (int) ($nivel['financiamientos_requeridos'] ?? 0),
                'porcentajes' => collect($nivel['porcentajes'] ?? [])->only(['taller', 'celular'])->map(fn ($valor) => (float) $valor)->all(),
            ])
            ->sortBy('financiamientos_requeridos')
            ->values()
            ->all();
    }

    private function imagenDelSistema(string $codigo): ?string
    {
        $ruta = self::IMAGENES_DEL_SISTEMA[$codigo] ?? null;

        return $ruta ? $this->erp->recurso($ruta) : null;
    }
}
