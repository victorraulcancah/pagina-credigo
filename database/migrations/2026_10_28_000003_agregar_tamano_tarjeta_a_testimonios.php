<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Cada historia elige también el ancho de su tarjeta en la página Historias (pequeña, mediana o grande). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('testimonios', function (Blueprint $table) {
            $table->string('tamano_tarjeta', 10)->default('mediana')->after('tamano_foto');
        });
    }

    public function down(): void
    {
        Schema::table('testimonios', function (Blueprint $table) {
            $table->dropColumn('tamano_tarjeta');
        });
    }
};
