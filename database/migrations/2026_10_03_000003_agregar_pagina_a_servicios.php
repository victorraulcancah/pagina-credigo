<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Página propia de cada plan (/servicios/{slug}): la dirección web del plan y
 * un texto largo con el detalle (cómo funciona, adjudicación, condiciones).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('servicios', function (Blueprint $table) {
            $table->string('slug', 120)->nullable()->unique()->after('titulo');
            $table->text('detalle')->nullable()->after('descripcion');
        });

        // Los planes que ya existen reciben su dirección a partir del nombre
        $usados = [];
        foreach (DB::table('servicios')->orderBy('id')->get(['id', 'titulo']) as $servicio) {
            $base = Str::slug($servicio->titulo) ?: 'plan';
            $slug = $base;
            for ($i = 2; in_array($slug, $usados, true); $i++) {
                $slug = "{$base}-{$i}";
            }
            $usados[] = $slug;
            DB::table('servicios')->where('id', $servicio->id)->update(['slug' => $slug]);
        }
    }

    public function down(): void
    {
        Schema::table('servicios', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn(['slug', 'detalle']);
        });
    }
};
