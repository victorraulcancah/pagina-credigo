<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DocumentoRequest;
use App\Http\Resources\DocumentoResource;
use App\Models\Servicio;
use App\Services\DocumentoService;
use Inertia\Inertia;
use Inertia\Response;

/** Pantalla de Documentos (PDFs). Subir, editar y eliminar van por la API: /api/admin/documentos. */
class DocumentoController extends Controller
{
    public function index(DocumentoService $documentos): Response
    {
        return Inertia::render('Admin/Documentos/Index', [
            'documentos' => DocumentoResource::collection($documentos->listar())->resolve(),
            'categorias' => $documentos->categorias(),
            'planes' => Servicio::ordenado()->get(['id', 'titulo']),
            'maxMb' => DocumentoRequest::MAX_MB,
        ]);
    }
}
