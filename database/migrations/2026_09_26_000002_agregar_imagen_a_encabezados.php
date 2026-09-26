<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/** Los encabezados de página (Nosotros, Servicios, Contacto) ahora aceptan imagen de fondo. */
return new class extends Migration
{
    public function up(): void
    {
        $this->cambiarCampos(fn (array $campos) => array_values(array_unique([...$campos, 'imagen'])));
    }

    public function down(): void
    {
        $this->cambiarCampos(fn (array $campos) => array_values(array_diff($campos, ['imagen'])));
    }

    private function cambiarCampos(callable $cambio): void
    {
        DB::table('secciones')->where('clave', 'hero')->get(['id', 'campos'])->each(function ($seccion) use ($cambio) {
            $campos = $cambio(json_decode($seccion->campos, true) ?? []);
            DB::table('secciones')->where('id', $seccion->id)->update(['campos' => json_encode($campos)]);
        });
    }
};
