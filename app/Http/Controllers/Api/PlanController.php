<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\DocumentoResource;
use App\Http\Resources\ServicioResource;
use App\Services\DocumentoService;
use App\Services\ServicioService;
use Illuminate\Http\JsonResponse;

/** Planes visibles del sitio con sus opciones del cotizador (montos referenciales). */
class PlanController extends BaseApiController
{
    public function __construct(private ServicioService $servicios) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(ServicioResource::collection($this->servicios->visibles()), 'Planes');
    }

    /** Un plan por su dirección (ej. credi-motos), con su ficha en PDF y los demás planes. */
    public function show(string $slug, DocumentoService $documentos): JsonResponse
    {
        $plan = $this->servicios->publicoPorSlug($slug);

        if (! $plan) {
            return $this->notFoundResponse('Ese plan no existe o no está disponible');
        }

        return $this->successResponse([
            'plan' => new ServicioResource($plan),
            'documentos' => DocumentoResource::collection($documentos->publicos('planes', $plan->id)),
            'otros' => ServicioResource::collection($this->servicios->otros($plan)),
        ], 'Plan');
    }
}
