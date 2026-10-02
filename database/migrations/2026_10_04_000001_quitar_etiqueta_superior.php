<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Estilo nuevo: los títulos ya no llevan una etiqueta amarilla encima. En las secciones que
 * ya no la muestran se quita el campo "Etiqueta superior" del panel (el texto guardado se conserva).
 */
return new class extends Migration
{
    /** Todos los encabezados de página + las secciones rediseñadas */
    private const SECCIONES = [
        ['inicio', 'servicios'], ['inicio', 'como_funciona'], ['inicio', 'nosotros'],
        ['requisitos', 'documentos'], ['requisitos', 'datos'], ['requisitos', 'proceso'], ['requisitos', 'empresas'],
        ['pagos', 'medios'], ['pagos', 'cuentas'], ['pagos', 'despues'], ['pagos', 'descuento'],
    ];

    public function up(): void
    {
        $this->cambiarCampos(fn (array $campos) => array_values(array_diff($campos, ['subtitulo'])));
    }

    public function down(): void
    {
        $this->cambiarCampos(fn (array $campos) => in_array('subtitulo', $campos, true) ? $campos : ['subtitulo', ...$campos]);
    }

    private function cambiarCampos(callable $cambio): void
    {
        $secciones = DB::table('secciones')
            ->where('clave', 'hero')
            ->orWhere(function ($q) {
                foreach (self::SECCIONES as [$pagina, $clave]) {
                    $q->orWhere(fn ($w) => $w->where('pagina', $pagina)->where('clave', $clave));
                }
            })
            ->get(['id', 'campos']);

        foreach ($secciones as $seccion) {
            $campos = json_decode($seccion->campos ?? '[]', true) ?: [];
            DB::table('secciones')->where('id', $seccion->id)->update(['campos' => json_encode($cambio($campos))]);
        }
    }
};
