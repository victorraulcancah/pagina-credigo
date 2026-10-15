<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\TestimonioRequest;
use App\Http\Resources\TestimonioResource;
use App\Models\Testimonio;
use App\Services\TestimonioService;
use Illuminate\Http\JsonResponse;

/** Historias de conductores (testimonios) del sitio. */
class TestimonioController extends BaseApiController
{
    public function __construct(private TestimonioService $testimonios) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(TestimonioResource::collection($this->testimonios->listar()), 'Testimonios');
    }

    public function show(Testimonio $testimonio): JsonResponse
    {
        return $this->successResponse(new TestimonioResource($testimonio), 'Testimonio');
    }

    public function store(TestimonioRequest $request): JsonResponse
    {
        return $this->createdResponse(new TestimonioResource($this->testimonios->crear($request->validated())), 'Testimonio creado');
    }

    public function update(TestimonioRequest $request, Testimonio $testimonio): JsonResponse
    {
        return $this->successResponse(new TestimonioResource($this->testimonios->actualizar($testimonio, $request->validated())), 'Testimonio actualizado');
    }

    public function destroy(Testimonio $testimonio): JsonResponse
    {
        $this->testimonios->eliminar($testimonio);

        return $this->successResponse(null, 'Testimonio eliminado');
    }
}
