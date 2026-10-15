<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\CategoriaBlogRequest;
use App\Http\Resources\CategoriaBlogResource;
use App\Models\CategoriaBlog;
use App\Services\CategoriaBlogService;
use Illuminate\Http\JsonResponse;

/** Categorías del blog. */
class CategoriaBlogController extends BaseApiController
{
    public function __construct(private CategoriaBlogService $categorias) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(CategoriaBlogResource::collection($this->categorias->listar()), 'Categorías');
    }

    public function store(CategoriaBlogRequest $request): JsonResponse
    {
        return $this->createdResponse(new CategoriaBlogResource($this->categorias->crear($request->validated())), 'Categoría creada');
    }

    public function update(CategoriaBlogRequest $request, CategoriaBlog $categoria): JsonResponse
    {
        return $this->successResponse(new CategoriaBlogResource($this->categorias->actualizar($categoria, $request->validated())), 'Categoría actualizada');
    }

    /** Sus artículos no se borran: quedan sin categoría. */
    public function destroy(CategoriaBlog $categoria): JsonResponse
    {
        $this->categorias->eliminar($categoria);

        return $this->successResponse(null, 'Categoría eliminada');
    }
}
