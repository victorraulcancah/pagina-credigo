<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Seguimiento de solicitudes: estado, asesor asignado, notas internas y de dónde llegó. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mensajes_contacto', function (Blueprint $table) {
            $table->string('origen', 20)->default('contacto')->after('mensaje'); // contacto | cotizador
            $table->string('estado', 15)->default('nuevo')->after('origen'); // nuevo | contactado | inscrito | descartado
            $table->foreignId('asignado_a')->nullable()->after('estado')->constrained('users')->nullOnDelete();
            $table->text('notas')->nullable()->after('asignado_a');

            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::table('mensajes_contacto', function (Blueprint $table) {
            $table->dropConstrainedForeignId('asignado_a');
            $table->dropIndex(['estado']);
            $table->dropColumn(['origen', 'estado', 'notas']);
        });
    }
};
