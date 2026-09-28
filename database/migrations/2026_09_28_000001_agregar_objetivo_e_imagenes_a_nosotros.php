<?php

use Database\Seeders\ContenidoSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Nosotros: Misión y Visión aceptan imagen, y se agrega la sección "Objetivo".
 * En una instalación nueva la tabla está vacía y todo lo crea el ContenidoSeeder.
 */
return new class extends Migration
{
    private const CAMPOS_CON_IMAGEN = ['titulo', 'contenido', 'imagen'];

    public function up(): void
    {
        DB::table('secciones')
            ->where('pagina', 'nosotros')
            ->whereIn('clave', ['mision', 'vision'])
            ->update(['campos' => json_encode(self::CAMPOS_CON_IMAGEN)]);

        $vision = DB::table('secciones')->where('pagina', 'nosotros')->where('clave', 'vision')->first();
        $existe = DB::table('secciones')->where('pagina', 'nosotros')->where('clave', 'objetivo')->exists();

        if ($vision && ! $existe) {
            // Mismo orden que Visión: al ordenar por orden e id queda justo después
            DB::table('secciones')->insert([
                ...ContenidoSeeder::OBJETIVO,
                'pagina' => 'nosotros',
                'clave' => 'objetivo',
                'nombre' => 'Nosotros · Objetivo',
                'campos' => json_encode(self::CAMPOS_CON_IMAGEN),
                'orden' => $vision->orden,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('secciones')->where('pagina', 'nosotros')->where('clave', 'objetivo')->delete();

        DB::table('secciones')
            ->where('pagina', 'nosotros')
            ->whereIn('clave', ['mision', 'vision'])
            ->update(['campos' => json_encode(['titulo', 'contenido'])]);
    }
};
