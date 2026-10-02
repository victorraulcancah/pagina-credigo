<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Documentos PDF que se suben en el panel y se descargan en la web (requisitos, fichas de planes, guías, legales). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documentos', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 150);
            $table->string('descripcion', 300)->nullable();
            $table->string('categoria', 30)->index();
            // Solo en la categoría "planes": la ficha de un plan en particular
            $table->foreignId('servicio_id')->nullable()->constrained('servicios')->nullOnDelete();
            $table->string('archivo');
            $table->unsignedInteger('tamano')->default(0);
            $table->unsignedInteger('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documentos');
    }
};
