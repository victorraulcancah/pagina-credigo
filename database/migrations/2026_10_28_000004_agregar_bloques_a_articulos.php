<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * El artículo se arma con bloques en orden: de texto (con formato) y de fotos (cada uno con su tamaño,
 * diseño y animación). `contenido` queda con el texto de los bloques (tiempo de lectura, respaldo) y,
 * en los artículos anteriores, sigue siendo lo que se muestra mientras no tengan bloques.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('articulos', function (Blueprint $table) {
            $table->json('bloques')->nullable()->after('contenido');
        });
    }

    public function down(): void
    {
        Schema::table('articulos', function (Blueprint $table) {
            $table->dropColumn('bloques');
        });
    }
};
