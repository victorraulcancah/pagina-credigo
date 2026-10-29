<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Oficinas de la empresa (Arequipa, Lima…): se muestran como "Nuestras oficinas" en el pie y en Soporte.
 * La dirección única de Empresa y contacto sigue siendo el domicilio del Libro de Reclamaciones; se copia
 * como primera sede para que al agregar otras no desaparezca del pie.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sedes', function (Blueprint $table) {
            $table->id();
            $table->string('ciudad', 80);
            $table->string('nombre', 100)->nullable(); // ej. "Oficina principal"
            $table->string('direccion', 255);
            $table->string('telefono', 30)->nullable();
            $table->string('horario', 150)->nullable();
            $table->string('mapa_url', 500)->nullable(); // enlace de Google Maps
            $table->unsignedInteger('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        $ajustes = DB::table('configuraciones')->whereIn('clave', ['contacto_direccion', 'contacto_ciudad', 'contacto_horario'])->pluck('valor', 'clave');

        if (filled($ajustes['contacto_direccion'] ?? null)) {
            DB::table('sedes')->insert([
                'ciudad' => $ajustes['contacto_ciudad'] ?: 'Sede principal',
                'direccion' => $ajustes['contacto_direccion'],
                'horario' => $ajustes['contacto_horario'] ?? null,
                'orden' => 0,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sedes');
    }
};
