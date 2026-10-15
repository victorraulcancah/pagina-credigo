<?php

use Database\Seeders\ContenidoSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Blog de la empresa (/blog) con 3 categorías fijas: Eventos, Noticias y Tendencias, cada una
 * con su página (/blog/eventos…). Cada artículo va dentro de su categoría
 * (/blog/noticias/{articulo}), con portada y contenido con subtítulos, viñetas e imágenes.
 * Se ve en el sitio cuando está publicado y su fecha ya llegó (con fecha futura queda programado).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categorias_blog', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 60);
            $table->string('slug', 80)->unique();
            $table->unsignedInteger('orden')->default(0);
            $table->timestamps();
        });

        Schema::create('articulos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_blog_id')->nullable()->constrained('categorias_blog')->nullOnDelete();
            $table->string('titulo', 160);
            $table->string('slug', 180)->unique();
            $table->string('resumen', 300)->nullable();
            $table->longText('contenido'); // "## " subtítulo · "- " viñeta · "![texto](url)" imagen · línea en blanco = párrafo
            $table->string('portada')->nullable();
            $table->string('video_url')->nullable();
            $table->string('autor', 80)->nullable();
            $table->boolean('publicado')->default(false); // false = borrador
            $table->boolean('destacado')->default(false);
            $table->timestamp('publicado_at')->nullable(); // fecha que se muestra; futura = programado
            $table->timestamps();

            $table->index(['publicado', 'publicado_at']);
        });

        // Las 3 categorías del blog (fijas: el menú y las direcciones dependen de ellas)
        $ahora = now();
        DB::table('categorias_blog')->insert([
            ['nombre' => 'Eventos', 'slug' => 'eventos', 'orden' => 0, 'created_at' => $ahora, 'updated_at' => $ahora],
            ['nombre' => 'Noticias', 'slug' => 'noticias', 'orden' => 1, 'created_at' => $ahora, 'updated_at' => $ahora],
            ['nombre' => 'Tendencias', 'slug' => 'tendencias', 'orden' => 2, 'created_at' => $ahora, 'updated_at' => $ahora],
        ]);

        // Encabezado de la página /blog
        ContenidoSeeder::crearSecciones(['blog']);
    }

    public function down(): void
    {
        Schema::dropIfExists('articulos');
        Schema::dropIfExists('categorias_blog');
        DB::table('secciones')->where('pagina', 'blog')->delete();
    }
};
