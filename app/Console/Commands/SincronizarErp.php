<?php

namespace App\Console\Commands;

use App\Services\Erp\CatalogosErp;
use Illuminate\Console\Command;

/** Refresca la copia de los catálogos del ERP (programado cada 30 minutos). */
class SincronizarErp extends Command
{
    protected $signature = 'erp:sincronizar';

    protected $description = 'Descarga del ERP talleres, comercios, cupones y precios, y actualiza la copia de la web';

    public function handle(CatalogosErp $catalogos): int
    {
        if (! config('services.erp.url')) {
            $this->warn('ERP_URL no está configurado: no hay nada que sincronizar.');

            return self::SUCCESS;
        }

        foreach ($catalogos->estado(sincronizar: true) as $nombre => $estado) {
            $linea = sprintf('%-10s %3d  (actualizado: %s)', $nombre, $estado['cantidad'], $estado['actualizado'] ?? 'nunca');
            // Si el ERP no respondió se sigue usando la última copia
            $estado['fallo'] ? $this->warn("{$linea}  sin respuesta del ERP") : $this->line($linea);
        }

        return self::SUCCESS;
    }
}
