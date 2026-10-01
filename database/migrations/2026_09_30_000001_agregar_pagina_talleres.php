<?php

use Database\Seeders\ContenidoSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/** Página "Talleres aliados": crea sus secciones (la lista de talleres viene del ERP). */
return new class extends Migration
{
    public function up(): void
    {
        ContenidoSeeder::crearSecciones(['talleres']);
    }

    public function down(): void
    {
        DB::table('secciones')->where('pagina', 'talleres')->delete();
    }
};
