<?php

namespace App\Services\Erp;

/** Todos los catálogos del ERP que usa la web (para sincronizar juntos y mostrar su estado). */
class CatalogosErp
{
    public function __construct(
        private TalleresErp $talleres,
        private ComerciosErp $comercios,
        private CuponesErp $cupones,
        private PlanesErp $planes,
    ) {}

    /** @return array<string, CatalogoErp> */
    public function todos(): array
    {
        return [
            'talleres' => $this->talleres,
            'comercios' => $this->comercios,
            'cupones' => $this->cupones,
            'planes' => $this->planes,
        ];
    }

    /** Cantidad y fecha de cada catálogo. Con $sincronizar descarga todo de nuevo. */
    public function estado(bool $sincronizar = false): array
    {
        return collect($this->todos())
            ->map(function (CatalogoErp $catalogo) use ($sincronizar) {
                $datos = $sincronizar ? $catalogo->sincronizar() : $catalogo->catalogo();

                return ['cantidad' => count($datos['items']), 'actualizado' => $datos['actualizado']];
            })
            ->all();
    }
}
