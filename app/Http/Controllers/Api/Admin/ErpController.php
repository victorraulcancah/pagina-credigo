<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\Erp\CatalogosErp;
use Illuminate\Http\JsonResponse;

/** Datos que la web lee del ERP (talleres, comercios, cupones y precios de planes). */
class ErpController extends BaseApiController
{
    public function __construct(private CatalogosErp $catalogos) {}

    public function estado(): JsonResponse
    {
        return $this->successResponse([
            'configurado' => (bool) config('services.erp.url'),
            'catalogos' => $this->catalogos->estado(),
        ], 'Estado del ERP');
    }

    /** Descarga todos los catálogos ya mismo (sin esperar la actualización automática). */
    public function sincronizar(): JsonResponse
    {
        $fallaron = $this->catalogos->sincronizarTodo();

        if ($fallaron) {
            return $this->errorResponse('El ERP no respondió para: '.implode(', ', $fallaron).'. Se sigue mostrando la última copia.', 502);
        }

        return $this->successResponse(['catalogos' => $this->catalogos->estado()], 'Datos del ERP actualizados');
    }
}
