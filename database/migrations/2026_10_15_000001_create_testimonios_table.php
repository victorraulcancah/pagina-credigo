<?php

use Database\Seeders\ContenidoSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Historias de conductores (testimonios): se cargan en el panel y se ven en el inicio
 * y en /historias. Solo se publican las que tienen la autorización del conductor
 * (Ley 29733: su nombre, foto y comentario son datos personales).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('testimonios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 80);
            $table->string('ciudad', 60)->nullable();
            $table->text('comentario');
            $table->string('foto')->nullable(); // del conductor
            $table->string('foto_vehiculo')->nullable(); // su vehículo o la entrega
            $table->string('vehiculo', 80)->nullable(); // ej. "KIA Soluto · CrediYango"
            $table->unsignedTinyInteger('calificacion')->nullable(); // 1 a 5, solo si la dio el conductor
            $table->string('video_url')->nullable();
            $table->boolean('autorizado')->default(false);
            $table->unsignedInteger('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // Encabezado de la sección del inicio y de la página /historias
        ContenidoSeeder::crearSecciones(['inicio', 'historias']);
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonios');
        DB::table('secciones')->where('pagina', 'historias')->orWhere(fn ($q) => $q->where('pagina', 'inicio')->where('clave', 'testimonios'))->delete();
    }
};
