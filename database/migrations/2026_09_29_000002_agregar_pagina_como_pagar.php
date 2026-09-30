<?php

use Database\Seeders\ContenidoSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/** Página "Cómo pagar": crea sus secciones. En una instalación nueva las crea el ContenidoSeeder. */
return new class extends Migration
{
    public function up(): void
    {
        ContenidoSeeder::crearSecciones(['pagos']);
    }

    public function down(): void
    {
        DB::table('secciones')->where('pagina', 'pagos')->delete();
    }
};
