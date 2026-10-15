<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Color del título y del texto en los encabezados de las páginas (sobre su imagen de fondo
 * el blanco no siempre se lee bien). Vacío = blanco, como hasta ahora.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('secciones', function (Blueprint $table) {
            $table->string('color_titulo', 7)->nullable()->after('contenido');
            $table->string('color_texto', 7)->nullable()->after('color_titulo');
        });

        $this->cambiarCampos(fn (array $campos) => array_values(array_unique([...$campos, 'colores'])));
    }

    public function down(): void
    {
        $this->cambiarCampos(fn (array $campos) => array_values(array_diff($campos, ['colores'])));

        Schema::table('secciones', function (Blueprint $table) {
            $table->dropColumn(['color_titulo', 'color_texto']);
        });
    }

    /** Los encabezados (clave "hero") de todas las páginas pasan a tener colores editables. */
    private function cambiarCampos(Closure $cambio): void
    {
        DB::table('secciones')->where('clave', 'hero')->get(['id', 'campos'])->each(function ($seccion) use ($cambio) {
            $campos = $cambio(json_decode($seccion->campos ?? '[]', true) ?: []);
            DB::table('secciones')->where('id', $seccion->id)->update(['campos' => json_encode($campos)]);
        });
    }
};
