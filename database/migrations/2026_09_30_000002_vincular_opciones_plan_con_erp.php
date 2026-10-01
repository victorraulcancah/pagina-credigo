<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Opción del cotizador vinculada a un precio del ERP ("v7" variante, "b12" beneficio): sus montos se actualizan solos. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('opciones_plan', function (Blueprint $table) {
            $table->string('erp_ref', 30)->nullable()->after('servicio_id');
        });
    }

    public function down(): void
    {
        Schema::table('opciones_plan', function (Blueprint $table) {
            $table->dropColumn('erp_ref');
        });
    }
};
