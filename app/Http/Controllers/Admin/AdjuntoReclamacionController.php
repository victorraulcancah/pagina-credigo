<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ReclamacionAdjunto;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** Muestra un adjunto de una hoja de reclamación (foto, comprobante o video) desde el disco privado. */
class AdjuntoReclamacionController extends Controller
{
    public function __invoke(ReclamacionAdjunto $adjunto): StreamedResponse
    {
        return Storage::disk(ReclamacionAdjunto::DISCO)->response($adjunto->ruta, $adjunto->nombre_original);
    }
}
