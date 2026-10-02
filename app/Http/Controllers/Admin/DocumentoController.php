<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DocumentoRequest;
use App\Models\Documento;
use App\Models\Servicio;
use App\Services\ImagenService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/** PDFs descargables de la web: requisitos, fichas de planes, guías de pago y legales. */
class DocumentoController extends Controller
{
    private const CARPETA = 'documentos';

    public function __construct(private ImagenService $archivos) {}

    public function index(): Response
    {
        return Inertia::render('Admin/Documentos/Index', [
            'documentos' => Documento::ordenado()->with('servicio:id,titulo')->get(),
            'categorias' => collect(Documento::CATEGORIAS)->map(fn ($c, $clave) => ['valor' => $clave, 'nombre' => $c[0], 'url' => $c[1]])->values(),
            'planes' => Servicio::ordenado()->get(['id', 'titulo']),
            'maxMb' => DocumentoRequest::MAX_MB,
        ]);
    }

    public function store(DocumentoRequest $request): RedirectResponse
    {
        Documento::create([...$request->datos(), ...$this->guardarPdf($request->file('archivo'), $request->validated('titulo'))]);

        Inertia::flash('success', 'Documento subido');

        return back();
    }

    public function update(DocumentoRequest $request, Documento $documento): RedirectResponse
    {
        $datos = $request->datos();

        if ($request->hasFile('archivo')) {
            $datos = [...$datos, ...$this->guardarPdf($request->file('archivo'), $request->validated('titulo'))];
            $this->archivos->eliminar($documento->archivo);
        }

        $documento->update($datos);

        Inertia::flash('success', 'Documento actualizado');

        return back();
    }

    public function destroy(Documento $documento): RedirectResponse
    {
        $this->archivos->eliminar($documento->archivo);
        $documento->delete();

        Inertia::flash('success', 'Documento eliminado');

        return back();
    }

    /** Guarda el PDF con un nombre legible ("requisitos-para-inscribirte-a1b2c3.pdf"): es el que ve quien lo descarga. */
    private function guardarPdf(UploadedFile $pdf, string $titulo): array
    {
        $nombre = Str::limit(Str::slug($titulo), 80, '').'-'.Str::lower(Str::random(6)).'.pdf';

        return [
            'archivo' => $pdf->storeAs(self::CARPETA, $nombre, 'public'),
            'tamano' => $pdf->getSize(),
        ];
    }
}
