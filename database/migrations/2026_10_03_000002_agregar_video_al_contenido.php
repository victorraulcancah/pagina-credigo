<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Videos por enlace (YouTube, TikTok, Facebook o Vimeo): en secciones, planes y banners.
 * Las secciones que lo admiten suman el campo "video" a sus campos editables.
 */
return new class extends Migration
{
    /** [página, clave] de las secciones que pueden llevar video */
    private const SECCIONES = [
        ['inicio', 'como_funciona'],
        ['nosotros', 'historia'],
        ['requisitos', 'proceso'],
        ['pagos', 'medios'],
        ['pagos', 'despues'],
        ['talleres', 'como'],
    ];

    public function up(): void
    {
        foreach (['secciones', 'servicios', 'banners'] as $tabla) {
            Schema::table($tabla, function (Blueprint $table) {
                $table->string('video_url')->nullable();
            });
        }

        $this->cambiarCampos(fn (array $campos) => in_array('video', $campos, true) ? $campos : [...$campos, 'video']);
    }

    public function down(): void
    {
        $this->cambiarCampos(fn (array $campos) => array_values(array_diff($campos, ['video'])));

        foreach (['secciones', 'servicios', 'banners'] as $tabla) {
            Schema::table($tabla, function (Blueprint $table) {
                $table->dropColumn('video_url');
            });
        }
    }

    private function cambiarCampos(callable $cambio): void
    {
        foreach (self::SECCIONES as [$pagina, $clave]) {
            $seccion = DB::table('secciones')->where('pagina', $pagina)->where('clave', $clave)->first(['id', 'campos']);
            if (! $seccion) {
                continue;
            }

            $campos = json_decode($seccion->campos ?? '[]', true) ?: [];
            DB::table('secciones')->where('id', $seccion->id)->update(['campos' => json_encode($cambio($campos))]);
        }
    }
};
