<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\DocumentoRequest;
use App\Http\Resources\DocumentoResource;
use App\Models\Documento;
use App\Services\DocumentoService;
use Illuminate\Http\JsonResponse;

/** PDFs descargables de la web. */
class DocumentoController extends BaseApiController
{
    public function __construct(private DocumentoService $documentos) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(DocumentoResource::collection($this->documentos->listar()), 'Documentos');
    }

    public function show(Documento $documento): JsonResponse
    {
        return $this->successResponse(new DocumentoResource($documento->load('servicio:id,titulo')), 'Documento');
    }

    public function store(DocumentoRequest $request): JsonResponse
    {
        return $this->createdResponse(new DocumentoResource($this->documentos->crear($request->validated())), 'Documento subido');
    }

    public function update(DocumentoRequest $request, Documento $documento): JsonResponse
    {
        return $this->successResponse(new DocumentoResource($this->documentos->actualizar($documento, $request->validated())), 'Documento actualizado');
    }

    public function destroy(Documento $documento): JsonResponse
    {
        $this->documentos->eliminar($documento);

        return $this->successResponse(null, 'Documento eliminado');
    }
}
