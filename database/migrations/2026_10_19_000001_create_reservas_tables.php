<?php

use Database\Seeders\ContenidoSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Reservas desde la web (/reservar): viajes u otros servicios que se definen en el panel
 * (tipos de reserva). Cada reserva llega al panel (Reservas) y el cliente la manda por WhatsApp.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tipos_reserva', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 60);
            $table->string('slug', 70)->unique(); // /reservar?tipo=viaje (botones del banner)
            $table->string('descripcion', 160)->nullable();
            $table->boolean('pide_ruta')->default(true); // origen, destino y pasajeros
            $table->unsignedInteger('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tipo_reserva_id')->nullable()->constrained('tipos_reserva')->nullOnDelete();
            $table->string('tipo', 60); // nombre del tipo al reservar (queda aunque luego se borre el tipo)
            $table->string('nombre', 100);
            $table->string('telefono', 20);
            $table->string('origen', 150)->nullable();
            $table->string('destino', 150)->nullable();
            $table->date('fecha');
            $table->string('hora', 5)->nullable(); // HH:MM
            $table->unsignedTinyInteger('pasajeros')->nullable();
            $table->text('comentario')->nullable();
            $table->string('estado', 20)->default('pendiente');
            $table->text('notas')->nullable(); // internas, solo el equipo
            $table->string('ip', 45)->nullable();
            $table->timestamps();

            $table->index(['estado', 'fecha']);
        });

        $ahora = now();
        DB::table('tipos_reserva')->insert([
            'nombre' => 'Viaje', 'slug' => 'viaje', 'pide_ruta' => true, 'orden' => 0, 'activo' => true,
            'created_at' => $ahora, 'updated_at' => $ahora,
        ]);

        // Encabezado de la página /reservar
        ContenidoSeeder::crearSecciones(['reservar']);
    }

    public function down(): void
    {
        Schema::dropIfExists('reservas');
        Schema::dropIfExists('tipos_reserva');
        DB::table('secciones')->where('pagina', 'reservar')->delete();
    }
};
