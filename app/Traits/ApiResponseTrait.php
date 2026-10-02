<?php

namespace App\Traits;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;

trait ApiResponseTrait
{
    /**
     * Respuesta paginada: los elementos pasan por el Resource y la paginación va aparte
     * { success, message, data: [...], pagination: { current_page, last_page, per_page, total } }
     *
     * @param  class-string<JsonResource>  $resource
     */
    protected function paginatedResponse(LengthAwarePaginator $paginador, string $resource, string $message = 'Operación exitosa', array $extra = []): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $resource::collection($paginador->items()),
            'pagination' => [
                'current_page' => $paginador->currentPage(),
                'last_page' => $paginador->lastPage(),
                'per_page' => $paginador->perPage(),
                'total' => $paginador->total(),
            ],
            ...$extra,
        ]);
    }

    /**
     * Respuesta exitosa. `$extra` va junto a `data` (ej. `opciones` de un formulario del panel).
     */
    protected function successResponse(
        mixed $data = null,
        string $message = 'Operación exitosa',
        int $statusCode = 200,
        array $extra = [],
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            ...$extra,
        ], $statusCode);
    }

    /**
     * Respuesta de error
     */
    protected function errorResponse(
        string $message = 'Error en la operación',
        int $statusCode = 500,
        mixed $errors = null
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Respuesta de validación fallida
     */
    protected function validationErrorResponse(array $errors): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Validación fallida',
            'errors' => $errors,
        ], 422);
    }

    /**
     * Respuesta de recurso no encontrado
     */
    protected function notFoundResponse(string $message = 'Recurso no encontrado'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], 404);
    }

    /**
     * Respuesta de recurso creado
     */
    protected function createdResponse(mixed $data, string $message = 'Recurso creado exitosamente'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], 201);
    }

    /**
     * Respuesta de acceso denegado
     */
    protected function forbiddenResponse(string $message = 'Acceso denegado'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], 403);
    }

    /**
     * Respuesta de no autorizado
     */
    protected function unauthorizedResponse(string $message = 'No autorizado'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], 401);
    }
}
