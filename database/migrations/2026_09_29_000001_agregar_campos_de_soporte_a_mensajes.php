<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** El formulario de Contacto copia el de soporte del ERP: apellido y tipo de consulta. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mensajes_contacto', function (Blueprint $table) {
            $table->string('apellido', 100)->nullable()->after('nombre');
            $table->string('tipo_consulta', 30)->nullable()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('mensajes_contacto', function (Blueprint $table) {
            $table->dropColumn(['apellido', 'tipo_consulta']);
        });
    }
};
