<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\ListarDocumentosRequest;
use App\Http\Resources\DocumentoResource;
use App\Services\DocumentoService;
use Illuminate\Http\JsonResponse;

/** PDFs visibles de una categoría (requisitos, planes, pagos, talleres o legal). */
class DocumentoController extends BaseApiController
{
    public function index(ListarDocumentosRequest $request, DocumentoService $documentos): JsonResponse
    {
        $servicioId = $request->filled('servicio_id') ? (int) $request->validated('servicio_id') : null;

        return $this->successResponse(
            DocumentoResource::collection($documentos->publicos($request->validated('categoria'), $servicioId)),
            'Documentos',
        );
    }
}
