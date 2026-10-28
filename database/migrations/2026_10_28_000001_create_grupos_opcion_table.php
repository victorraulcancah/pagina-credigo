<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Secciones dentro de la lista de opciones de un plan (ej. "Descuentos con YANGO" y
 * "Descuentos con INDRIVER", cada una con su logo). Una opción puede pertenecer a una
 * sección o ir suelta; al borrar la sección, sus opciones quedan sueltas.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grupos_opcion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('servicio_id')->constrained('servicios')->cascadeOnDelete();
            $table->string('titulo', 100);
            $table->string('imagen')->nullable(); // logo
            $table->unsignedInteger('orden')->default(0);
            $table->timestamps();
        });

        Schema::table('opciones_plan', function (Blueprint $table) {
            $table->foreignId('grupo_opcion_id')->nullable()->after('servicio_id')->constrained('grupos_opcion')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('opciones_plan', function (Blueprint $table) {
            $table->dropConstrainedForeignId('grupo_opcion_id');
        });

        Schema::dropIfExists('grupos_opcion');
    }
};
