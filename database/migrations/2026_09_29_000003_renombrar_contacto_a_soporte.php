<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * La página de contacto pasa a llamarse Soporte (/soporte; /contacto redirige).
 * Solo cambia lo que sigue con el texto original: no pisa lo editado en el panel.
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->renombrar('Contáctanos', 'Soporte', '/contacto', '/soporte', 'Contacto ·', 'Soporte ·');
    }

    public function down(): void
    {
        $this->renombrar('Soporte', 'Contáctanos', '/soporte', '/contacto', 'Soporte ·', 'Contacto ·');
    }

    private function renombrar(string $etiqueta, string $nuevaEtiqueta, string $url, string $nuevaUrl, string $prefijo, string $nuevoPrefijo): void
    {
        DB::table('secciones')->where('pagina', 'contacto')->where('clave', 'hero')
            ->where('subtitulo', $etiqueta)->update(['subtitulo' => $nuevaEtiqueta]);

        DB::table('secciones')->where('pagina', 'contacto')->where('nombre', 'like', "{$prefijo}%")
            ->update(['nombre' => DB::raw("REPLACE(nombre, '{$prefijo}', '{$nuevoPrefijo}')")]);

        // Mismo destino con el nombre nuevo (el enlace viejo igual redirige)
        DB::table('secciones')->where('boton_url', $url)->update(['boton_url' => $nuevaUrl]);
        DB::table('banners')->where('boton_url', $url)->update(['boton_url' => $nuevaUrl]);
        DB::table('banners')->where('boton2_url', $url)->update(['boton2_url' => $nuevaUrl]);
    }
};
