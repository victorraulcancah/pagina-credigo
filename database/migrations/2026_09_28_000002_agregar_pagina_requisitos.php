<?php

use Database\Seeders\ContenidoSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Página de requisitos: crea sus secciones y agrega a "Cómo funciona" del inicio
 * un botón hacia ella. En una instalación nueva todo lo crea el ContenidoSeeder.
 */
return new class extends Migration
{
    public function up(): void
    {
        ContenidoSeeder::crearSecciones(['requisitos']);

        $comoFunciona = DB::table('secciones')->where('pagina', 'inicio')->where('clave', 'como_funciona')->first();

        if ($comoFunciona) {
            $campos = json_decode($comoFunciona->campos, true) ?? [];

            DB::table('secciones')->where('id', $comoFunciona->id)->update([
                'campos' => json_encode(array_values(array_unique([...$campos, 'boton']))),
                // Solo si no tenía botón: no pisa lo editado
                ...($comoFunciona->boton_url ? [] : ContenidoSeeder::BOTON_REQUISITOS),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('secciones')->where('pagina', 'requisitos')->delete();

        $comoFunciona = DB::table('secciones')->where('pagina', 'inicio')->where('clave', 'como_funciona')->first();

        if ($comoFunciona) {
            $campos = array_values(array_diff(json_decode($comoFunciona->campos, true) ?? [], ['boton']));
            DB::table('secciones')->where('id', $comoFunciona->id)->update(['campos' => json_encode($campos)]);
        }
    }
};
