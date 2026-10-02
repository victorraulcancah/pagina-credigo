<?php

namespace App\Services;

use App\Models\Documento;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

/** PDFs descargables de la web: requisitos, fichas de planes, guías de pago y legales. */
class DocumentoService
{
    private const CARPETA = 'documentos';

    public function __construct(private ImagenService $archivos) {}

    public function listar(): Collection
    {
        return Documento::ordenado()->with('servicio:id,titulo')->get();
    }

    /** Los visibles de una categoría, en orden. `servicioId`: solo los de ese plan; `false`: solo los generales. */
    public function publicos(string $categoria, int|false|null $servicioId = null): Collection
    {
        return Documento::activo()
            ->categoria($categoria)
            ->when($servicioId === false, fn ($q) => $q->whereNull('servicio_id'))
            ->when(is_int($servicioId), fn ($q) => $q->where('servicio_id', $servicioId))
            ->ordenado()
            ->get();
    }

    /** [{ valor, nombre, url }] para el selector del panel. */
    public function categorias(): array
    {
        return collect(Documento::CATEGORIAS)
            ->map(fn ($categoria, $clave) => ['valor' => $clave, 'nombre' => $categoria[0], 'url' => $categoria[1]])
            ->values()
            ->all();
    }

    public function crear(array $datos): Documento
    {
        return Documento::create([...$this->normalizar($datos), ...$this->guardarPdf($datos['archivo'], $datos['titulo'])]);
    }

    /** Sin archivo nuevo se conserva el PDF; con uno nuevo se reemplaza y se borra el anterior. */
    public function actualizar(Documento $documento, array $datos): Documento
    {
        $cambios = $this->normalizar($datos);

        if (($datos['archivo'] ?? null) instanceof UploadedFile) {
            $cambios = [...$cambios, ...$this->guardarPdf($datos['archivo'], $datos['titulo'])];
            $this->archivos->eliminar($documento->archivo);
        }

        $documento->update($cambios);

        return $documento->refresh()->load('servicio:id,titulo');
    }

    public function eliminar(Documento $documento): void
    {
        $this->archivos->eliminar($documento->archivo);
        $documento->delete();
    }

    /** El plan solo aplica a las fichas de planes. */
    private function normalizar(array $datos): array
    {
        return [
            ...collect($datos)->except(['archivo', 'servicio_id'])->all(),
            'servicio_id' => ($datos['categoria'] ?? null) === 'planes' ? ($datos['servicio_id'] ?? null) : null,
        ];
    }

    /** Guarda el PDF con un nombre legible ("requisitos-para-inscribirte-a1b2c3.pdf"): es el que ve quien lo descarga. */
    private function guardarPdf(UploadedFile $pdf, string $titulo): array
    {
        $nombre = Str::limit(Str::slug($titulo), 80, '').'-'.Str::lower(Str::random(6)).'.pdf';

        return [
            'archivo' => $this->archivos->guardarComo($pdf, self::CARPETA, $nombre),
            'tamano' => $pdf->getSize(),
        ];
    }
}
