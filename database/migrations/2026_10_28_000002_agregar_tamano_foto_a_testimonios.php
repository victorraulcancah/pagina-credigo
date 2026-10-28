<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Cada historia elige la proporción de su foto en la página Historias (horizontal, cuadrada o vertical). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('testimonios', function (Blueprint $table) {
            $table->string('tamano_foto', 10)->default('horizontal')->after('foto_vehiculo');
        });
    }

    public function down(): void
    {
        Schema::table('testimonios', function (Blueprint $table) {
            $table->dropColumn('tamano_foto');
        });
    }
};
