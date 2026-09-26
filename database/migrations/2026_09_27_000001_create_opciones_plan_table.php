<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Opciones del cotizador: cada plan (servicio) tiene sus opciones con montos
 * referenciales (ej. "Auto · certificado 15k USD": inicial, cuota y n.º de cuotas).
 * No se calcula interés: el total es solo inicial + cuota × n.º de cuotas.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opciones_plan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('servicio_id')->constrained('servicios')->cascadeOnDelete();
            $table->string('nombre', 120);
            $table->string('nota')->nullable(); // ej. "Certificado de 15,000 USD"
            $table->string('moneda', 3)->default('PEN'); // PEN | USD
            $table->decimal('inicial', 10, 2)->nullable(); // inicial o inscripción
            $table->decimal('cuota', 10, 2)->nullable();
            $table->unsignedSmallInteger('numero_cuotas')->nullable();
            $table->string('frecuencia', 10)->default('semanal'); // semanal | quincenal | mensual
            $table->unsignedInteger('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opciones_plan');
    }
};
