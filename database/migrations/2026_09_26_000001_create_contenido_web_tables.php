<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ajustes del sitio (clave/valor): empresa, contacto, redes, colores, logo
        Schema::create('configuraciones', function (Blueprint $table) {
            $table->id();
            $table->string('clave', 100)->unique();
            $table->text('valor')->nullable();
            $table->timestamps();
        });

        // Slider principal de la página de inicio
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 150);
            $table->string('subtitulo', 255)->nullable();
            $table->string('imagen')->nullable();
            $table->string('boton_texto', 60)->nullable();
            $table->string('boton_url')->nullable();
            $table->unsignedInteger('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // Bloques de texto de cada página (inicio.cta, nosotros.mision, ...)
        Schema::create('secciones', function (Blueprint $table) {
            $table->id();
            $table->string('pagina', 50);
            $table->string('clave', 50);
            $table->string('nombre', 100); // etiqueta visible en el panel
            $table->string('subtitulo', 150)->nullable(); // texto pequeño sobre el título
            $table->string('titulo')->nullable();
            $table->text('contenido')->nullable();
            $table->string('imagen')->nullable();
            $table->string('boton_texto', 60)->nullable();
            $table->string('boton_url')->nullable();
            $table->json('items')->nullable(); // listas: pasos, valores, cifras
            $table->json('campos'); // campos editables de esta sección
            $table->unsignedInteger('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->unique(['pagina', 'clave']);
        });

        Schema::create('servicios', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 150);
            $table->text('descripcion');
            $table->string('icono', 50)->nullable(); // nombre de ícono (ver resources/js/lib/iconos.js)
            $table->string('imagen')->nullable();
            $table->boolean('destacado')->default(false); // se muestra en inicio
            $table->unsignedInteger('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        Schema::create('preguntas_frecuentes', function (Blueprint $table) {
            $table->id();
            $table->string('pregunta');
            $table->text('respuesta');
            $table->unsignedInteger('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // Mensajes enviados desde el formulario de contacto
        Schema::create('mensajes_contacto', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 120);
            $table->string('telefono', 20);
            $table->string('email', 150)->nullable();
            $table->string('asunto', 150)->nullable();
            $table->text('mensaje');
            $table->timestamp('leido_at')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamps();

            $table->index('leido_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mensajes_contacto');
        Schema::dropIfExists('preguntas_frecuentes');
        Schema::dropIfExists('servicios');
        Schema::dropIfExists('secciones');
        Schema::dropIfExists('banners');
        Schema::dropIfExists('configuraciones');
    }
};
