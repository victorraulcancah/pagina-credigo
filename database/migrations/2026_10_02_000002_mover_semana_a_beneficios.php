<?php

use Database\Seeders\ContenidoSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * La franja "Tu semana" deja el inicio (vuelve el carrusel de banners) y pasa a Beneficios,
 * donde explica el descuento por viajes. Conserva lo ya editado en el panel.
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->mover(['inicio', 'semana'], ['beneficios', 'semana'], 'Beneficios · Tu semana (franja de lunes a domingo)', 'beneficios');

        ContenidoSeeder::crearSecciones(['beneficios']);
    }

    public function down(): void
    {
        $this->mover(['beneficios', 'semana'], ['inicio', 'semana'], 'Inicio · Tu semana (franja de lunes a domingo)', 'inicio');
    }

    /** Cambia la sección de página (si el destino aún no existe) y la deja junto al encabezado de esa página. */
    private function mover(array $desde, array $hacia, string $nombre, string $pagina): void
    {
        $existeDestino = DB::table('secciones')->where('pagina', $hacia[0])->where('clave', $hacia[1])->exists();
        if ($existeDestino) {
            return;
        }

        $orden = DB::table('secciones')->where('pagina', $pagina)->min('orden') ?? 0;

        DB::table('secciones')
            ->where('pagina', $desde[0])
            ->where('clave', $desde[1])
            ->update(['pagina' => $hacia[0], 'clave' => $hacia[1], 'nombre' => $nombre, 'orden' => $orden]);
    }
};
