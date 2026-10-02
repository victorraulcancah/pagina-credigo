<?php

namespace App\Http\Controllers\Api;

use App\Services\Erp\ComerciosErp;
use App\Services\Erp\CuponesErp;
use App\Services\Erp\TalleresErp;
use Illuminate\Http\JsonResponse;

/**
 * Catálogos que la web copia del ERP (con caché). Solo campos públicos:
 * los servicios del ERP ya dejan fuera RUC, correos, datos bancarios y contratos.
 */
class CatalogoErpController extends BaseApiController
{
    public function talleres(TalleresErp $talleres): JsonResponse
    {
        return $this->successResponse($talleres->items(), 'Talleres aliados');
    }

    public function comercios(ComerciosErp $comercios): JsonResponse
    {
        return $this->successResponse($comercios->items(), 'Comercios GO');
    }

    /** Solo cupones públicos y vigentes hoy. */
    public function cupones(CuponesErp $cupones): JsonResponse
    {
        return $this->successResponse($cupones->vigentes(), 'Cupones');
    }
}
