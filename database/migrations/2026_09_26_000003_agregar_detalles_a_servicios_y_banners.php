<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Cada servicio/plan: etiqueta corta (ej. "Grupos de ahorro") y su lista de características
        Schema::table('servicios', function (Blueprint $table) {
            $table->string('etiqueta', 60)->nullable()->after('titulo');
            $table->json('caracteristicas')->nullable()->after('descripcion');
        });

        // Cada banner: etiqueta propia y un segundo botón (ej. "Ver cómo funciona")
        Schema::table('banners', function (Blueprint $table) {
            $table->string('etiqueta', 100)->nullable()->after('id');
            $table->string('boton2_texto', 60)->nullable()->after('boton_url');
            $table->string('boton2_url')->nullable()->after('boton2_texto');
        });
    }

    public function down(): void
    {
        Schema::table('servicios', function (Blueprint $table) {
            $table->dropColumn(['etiqueta', 'caracteristicas']);
        });

        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn(['etiqueta', 'boton2_texto', 'boton2_url']);
        });
    }
};
