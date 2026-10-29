<?php

namespace App\Services;

use App\Models\Seccion;
use App\Services\Erp\NivelesErp;
use Illuminate\Support\Str;

/**
 * Niveles de fidelización (Pollito, Bronce, Plata, Oro...) de las secciones "Beneficios" del inicio y de /beneficios.
 *
 * El ERP manda el nombre, la imagen, cuántos financiamientos pide cada nivel y su % de inicial; el panel solo aporta lo que el ERP
 * no tiene: la descripción de cada nivel (y su ícono, si el ERP no tiene imagen). Se unen por el nombre del nivel
 * (el código del ERP es el nombre en minúsculas y sin tildes). Si el ERP no responde, se usa lo escrito en el panel como siempre.
 */
class NivelesService
{
    /** Secciones (pagina.clave) cuya lista de elementos son los niveles. */
    public const SECCIONES = ['general.beneficios', 'beneficios.niveles'];

    public function __construct(private NivelesErp $erp) {}

    public function esDeNiveles(Seccion $seccion): bool
    {
        return in_array("{$seccion->pagina}.{$seccion->clave}", self::SECCIONES, true);
    }

    /** Niveles del ERP (de menor a mayor); vacío si no hay ERP o no respondió. */
    public function delErp(): array
    {
        return $this->erp->items();
    }

    /**
     * Los elementos de la sección con los datos del ERP. Un nivel del ERP sin texto en el panel sale igual (con sus números);
     * lo escrito en el panel para un nivel que ya no existe en el ERP no se muestra.
     */
    public function combinar(array $items): array
    {
        $niveles = $this->delErp();

        if ($niveles === []) {
            return $items;
        }

        $delPanel = collect($items)->keyBy(fn (array $item) => Str::slug($item['titulo'] ?? ''));

        return collect($niveles)->map(function (array $nivel) use ($delPanel) {
            $texto = $delPanel->get($nivel['codigo'], []);

            return [
                'titulo' => $nivel['nombre'],
                'descripcion' => $texto['descripcion'] ?? null,
                'icono' => $texto['icono'] ?? null,
                'imagen_url' => $nivel['imagen_url'],
                'financiamientos' => $nivel['financiamientos_requeridos'],
                'porcentajes' => $nivel['porcentajes'],
            ];
        })->all();
    }
}
