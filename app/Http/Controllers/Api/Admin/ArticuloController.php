<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\ArticuloRequest;
use App\Http\Requests\Admin\ImagenArticuloRequest;
use App\Http\Resources\ArticuloResource;
use App\Http\Resources\CategoriaBlogResource;
use App\Models\Articulo;
use App\Services\ArticuloService;
use App\Services\CategoriaBlogService;
use Illuminate\Http\JsonResponse;

/** Artículos del blog de la empresa. */
class ArticuloController extends BaseApiController
{
    public function __construct(private ArticuloService $articulos) {}

    /** Artículos + categorías (el formulario las necesita). */
    public function index(CategoriaBlogService $categorias): JsonResponse
    {
        return $this->successResponse(
            ArticuloResource::collection($this->articulos->listar()),
            'Artículos',
            extra: ['opciones' => ['categorias' => CategoriaBlogResource::collection($categorias->todas())]],
        );
    }

    public function show(Articulo $articulo): JsonResponse
    {
        return $this->successResponse(new ArticuloResource($articulo->load('categoria:id,nombre,slug')), 'Artículo');
    }

    public function store(ArticuloRequest $request): JsonResponse
    {
        return $this->createdResponse(new ArticuloResource($this->articulos->crear($request->validated())), 'Artículo creado');
    }

    public function update(ArticuloRequest $request, Articulo $articulo): JsonResponse
    {
        return $this->successResponse(new ArticuloResource($this->articulos->actualizar($articulo, $request->validated())), 'Artículo actualizado');
    }

    public function destroy(Articulo $articulo): JsonResponse
    {
        $this->articulos->eliminar($articulo);

        return $this->successResponse(null, 'Artículo eliminado');
    }

    /** POST /api/admin/articulos/imagenes: sube una imagen para el contenido y devuelve su dirección. */
    public function imagen(ImagenArticuloRequest $request): JsonResponse
    {
        return $this->createdResponse(['url' => $this->articulos->subirImagen($request->file('imagen'))], 'Imagen subida');
    }
}
