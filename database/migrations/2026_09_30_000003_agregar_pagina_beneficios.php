<?php

use Database\Seeders\ContenidoSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/** Página "Beneficios": crea sus secciones (comercios y cupones vienen del ERP). */
return new class extends Migration
{
    public function up(): void
    {
        ContenidoSeeder::crearSecciones(['beneficios']);
    }

    public function down(): void
    {
        DB::table('secciones')->where('pagina', 'beneficios')->delete();
    }
};
