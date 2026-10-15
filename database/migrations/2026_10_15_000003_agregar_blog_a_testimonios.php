<?php

use App\Models\Testimonio;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Cada historia tiene su propia página, como un blog (/historias/{slug}): un titular
 * y la historia completa, además del comentario corto que va en el carrusel.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('testimonios', function (Blueprint $table) {
            $table->string('slug', 120)->nullable()->unique()->after('nombre');
            $table->string('titulo', 150)->nullable()->after('slug'); // ej. "Del aplicativo a mi propio auto"
            $table->text('historia')->nullable()->after('comentario');
        });

        // Las historias que ya existen reciben su dirección a partir del nombre
        DB::table('testimonios')->orderBy('id')->get(['id', 'nombre'])->each(fn ($t) => DB::table('testimonios')
            ->where('id', $t->id)
            ->update(['slug' => Testimonio::slugLibre($t->nombre, $t->id)]));
    }

    public function down(): void
    {
        Schema::table('testimonios', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn(['slug', 'titulo', 'historia']);
        });
    }
};
