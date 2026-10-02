<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\ConsultarReclamacionRequest;
use App\Http\Requests\ReclamacionRequest;
use App\Http\Resources\ReclamacionEstadoResource;
use App\Services\ReclamacionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\URL;

/** Libro de Reclamaciones virtual: registrar una hoja y consultar su estado. */
class ReclamacionController extends BaseApiController
{
    public function __construct(private ReclamacionService $reclamaciones) {}

    /**
     * Registra la hoja y devuelve su número con el enlace firmado a la constancia
     * (solo lo ve quien la registró: el número no basta para abrirla).
     */
    public function store(ReclamacionRequest $request): JsonResponse
    {
        $reclamacion = $this->reclamaciones->registrar($request->datos(), $request->archivos(), $request->ip());

        return $this->createdResponse([
            'codigo' => $reclamacion->codigo,
            'constancia_url' => URL::signedRoute('reclamaciones.constancia', $reclamacion),
        ], "Registramos tu hoja N.° {$reclamacion->codigo}");
    }

    /** Estado y respuesta de una hoja, con su número y el documento de quien la registró. */
    public function consultar(ConsultarReclamacionRequest $request): JsonResponse
    {
        $reclamacion = $this->reclamaciones->consultar($request->validated('codigo'), $request->validated('numero_documento'));

        if (! $reclamacion) {
            return $this->errorResponse('No encontramos una hoja con ese número y documento. Revisa los datos.', 404, [
                'codigo' => ['No encontramos una hoja con ese número y documento. Revisa los datos.'],
            ]);
        }

        return $this->successResponse(new ReclamacionEstadoResource($reclamacion), 'Estado de tu hoja');
    }
}
