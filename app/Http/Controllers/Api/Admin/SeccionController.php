<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\SeccionRequest;
use App\Http\Resources\SeccionResource;
use App\Models\Seccion;
use App\Services\SeccionService;
use Illuminate\Http\JsonResponse;

/** Secciones de contenido: fijas (las crea el seeder); desde el panel solo se editan o se ocultan. */
class SeccionController extends BaseApiController
{
    public function __construct(private SeccionService $secciones) {}

    public function index(): JsonResponse
    {
        return $this->successResponse($this->secciones->paraPanel(), 'Secciones');
    }

    public function show(Seccion $seccion): JsonResponse
    {
        return $this->successResponse(new SeccionResource($seccion), 'Sección');
    }

    public function update(SeccionRequest $request, Seccion $seccion): JsonResponse
    {
        return $this->successResponse(new SeccionResource($this->secciones->actualizar($seccion, $request->validated())), 'Sección actualizada');
    }
}
