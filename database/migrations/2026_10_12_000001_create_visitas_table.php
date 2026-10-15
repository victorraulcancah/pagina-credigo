<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Contador de visitas del sitio público, un renglón por día (hora de Perú).
 * - visitas: personas distintas que entraron ese día.
 * - paginas_vistas: cuántas páginas abrieron entre todas.
 *
 * `visitantes_dia` solo sirve para no contar dos veces a la misma persona en el día:
 * guarda una huella irreversible (no la IP) y se vacía sola al día siguiente.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visitas_diarias', function (Blueprint $table) {
            $table->date('fecha')->primary();
            $table->unsignedInteger('visitas')->default(0);
            $table->unsignedInteger('paginas_vistas')->default(0);
        });

        Schema::create('visitantes_dia', function (Blueprint $table) {
            $table->date('fecha');
            $table->char('huella', 64);
            $table->primary(['fecha', 'huella']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitantes_dia');
        Schema::dropIfExists('visitas_diarias');
    }
};
