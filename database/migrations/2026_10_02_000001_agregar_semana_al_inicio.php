<?php

use Database\Seeders\ContenidoSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/** Nuevo inicio: franja "Tu semana" (lunes a domingo), editable en el panel. */
return new class extends Migration
{
    public function up(): void
    {
        ContenidoSeeder::crearSecciones(['inicio']);
    }

    public function down(): void
    {
        DB::table('secciones')->where('pagina', 'inicio')->where('clave', 'semana')->delete();
    }
};
