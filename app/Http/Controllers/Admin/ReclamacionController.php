<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\FiltroReclamacionesRequest;
use App\Http\Resources\ReclamacionResource;
use App\Models\Reclamacion;
use App\Models\ReclamacionAdjunto;
use App\Services\ReclamacionService;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Pantalla del Libro de Reclamaciones y sus adjuntos (disco privado, solo con sesión).
 * Responder va por la API: PUT /api/admin/reclamaciones/{id}/respuesta. Las hojas no se eliminan.
 */
class ReclamacionController extends Controller
{
    public function index(FiltroReclamacionesRequest $request, ReclamacionService $reclamaciones): Response
    {
        $estado = $request->validated('estado') ?? 'todos';

        return Inertia::render('Admin/Reclamaciones/Index', [
            'reclamaciones' => $reclamaciones->paginar($request->validated('buscar'), $estado)
                ->through(fn (Reclamacion $reclamacion) => (new ReclamacionResource($reclamacion))->resolve()),
            'filtros' => ['buscar' => $request->validated('buscar') ?? '', 'estado' => $estado],
            'diasRespuesta' => Reclamacion::DIAS_HABILES_RESPUESTA,
        ]);
    }

    /** Muestra un adjunto (foto, comprobante o video) desde el disco privado. */
    public function adjunto(ReclamacionAdjunto $adjunto): StreamedResponse
    {
        return Storage::disk(ReclamacionAdjunto::DISCO)->response($adjunto->ruta, $adjunto->nombre_original);
    }
}
