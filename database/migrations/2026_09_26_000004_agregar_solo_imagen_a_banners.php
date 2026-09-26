<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            // Banner diseñado (ej. en Canva) que ya trae sus textos: se muestra sin título ni botones encima
            $table->boolean('solo_imagen')->default(false)->after('imagen');
            // Versión vertical para celular (opcional); si no hay, se usa la imagen normal
            $table->string('imagen_movil')->nullable()->after('solo_imagen');
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn(['solo_imagen', 'imagen_movil']);
        });
    }
};
