<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Libro de Reclamaciones virtual (Código de Protección y Defensa del Consumidor,
 * Ley N° 29571, y su reglamento). Cada fila es una hoja de reclamación.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reclamaciones', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 20)->nullable()->unique(); // correlativo: 2026-000001
            $table->string('tipo', 10); // reclamo | queja

            // 1. Consumidor reclamante
            $table->string('nombre', 150);
            $table->string('tipo_documento', 20);
            $table->string('numero_documento', 20);
            $table->string('domicilio');
            $table->string('telefono', 20);
            $table->string('email', 150);
            $table->boolean('menor_de_edad')->default(false);
            $table->string('apoderado', 150)->nullable(); // padre, madre o tutor si es menor

            // 2. Bien contratado
            $table->string('tipo_bien', 10); // producto | servicio
            $table->decimal('monto_reclamado', 10, 2)->nullable();
            $table->text('descripcion_bien');

            // 3. Detalle de la reclamación
            $table->text('detalle');
            $table->text('pedido');

            // Datos del proveedor al momento del registro (razón social, RUC, dirección)
            $table->json('proveedor');

            // 4. Respuesta del proveedor
            $table->string('estado', 15)->default('pendiente'); // pendiente | atendido
            $table->text('respuesta')->nullable();
            $table->timestamp('respondido_at')->nullable();
            $table->foreignId('respondido_por')->nullable()->constrained('users')->nullOnDelete();

            $table->string('ip', 45)->nullable();
            $table->timestamps();

            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reclamaciones');
    }
};
