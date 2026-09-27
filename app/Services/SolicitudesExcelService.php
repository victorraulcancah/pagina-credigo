<?php

namespace App\Services;

use App\Models\MensajeContacto;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** Exporta las solicitudes de la bandeja a Excel (.xlsx). */
class SolicitudesExcelService
{
    private const COLUMNAS = [
        'Fecha', 'Nombre', 'Celular', 'Correo', 'Asunto', 'Mensaje', 'Origen', 'Estado', 'Asignado a', 'Notas',
    ];

    /** @param  Collection<int, MensajeContacto>  $mensajes */
    public function descargar(Collection $mensajes, string $nombreArchivo): StreamedResponse
    {
        $libro = new Spreadsheet;
        $hoja = $libro->getActiveSheet();
        $hoja->setTitle('Solicitudes');

        $hoja->fromArray(self::COLUMNAS);
        $hoja->fromArray($mensajes->map(fn (MensajeContacto $m) => [
            $m->created_at->format('d/m/Y H:i'),
            $m->nombre,
            $m->telefono,
            $m->email,
            $m->asunto,
            $m->mensaje,
            MensajeContacto::ORIGENES[$m->origen] ?? $m->origen,
            MensajeContacto::ESTADOS[$m->estado] ?? $m->estado,
            $m->asignado?->name,
            $m->notas,
        ])->all(), null, 'A2');

        // Encabezado en negrita con fondo, columnas con ancho automático y filtros
        $ultimaColumna = $hoja->getHighestColumn();
        $encabezado = $hoja->getStyle("A1:{$ultimaColumna}1");
        $encabezado->getFont()->setBold(true);
        $encabezado->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F8EC34');
        foreach (range('A', $ultimaColumna) as $columna) {
            $hoja->getColumnDimension($columna)->setAutoSize(true);
        }
        $hoja->getColumnDimension('F')->setAutoSize(false)->setWidth(60); // mensaje
        $hoja->setAutoFilter($hoja->calculateWorksheetDimension());
        $hoja->freezePane('A2');

        return response()->streamDownload(
            fn () => (new Xlsx($libro))->save('php://output'),
            $nombreArchivo,
            ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        );
    }
}
