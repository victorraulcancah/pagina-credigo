<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Hoja de reclamación completa: apoderado, datos de la compra, solución esperada, confirmaciones y adjuntos. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reclamaciones', function (Blueprint $table) {
            // Apoderado (si el consumidor es menor de edad)
            $table->string('apoderado_tipo_documento', 20)->nullable()->after('apoderado');
            $table->string('apoderado_numero_documento', 20)->nullable()->after('apoderado_tipo_documento');

            // Información de la compra (opcional)
            $table->string('comprobante_tipo', 20)->nullable()->after('tipo_bien');
            $table->string('comprobante_numero', 30)->nullable()->after('comprobante_tipo');
            $table->date('fecha_compra')->nullable()->after('comprobante_numero');
            $table->string('numero_contrato', 30)->nullable()->after('fecha_compra'); // código de asociado o N° de contrato
            $table->string('producto_codigo', 50)->nullable()->after('numero_contrato');
            $table->string('producto_nombre', 150)->nullable()->after('producto_codigo');
            $table->string('producto_marca', 80)->nullable()->after('producto_nombre');
            $table->string('producto_modelo', 80)->nullable()->after('producto_marca');

            // Solución que espera el consumidor
            $table->string('solucion_esperada', 30)->nullable()->after('detalle');
            $table->string('solucion_otra')->nullable()->after('solucion_esperada');

            // Confirmaciones del consumidor al enviar
            $table->boolean('declara_veracidad')->default(false)->after('pedido');
            $table->boolean('acepta_datos')->default(false)->after('declara_veracidad');
            $table->boolean('conforme')->default(false)->after('acepta_datos');
        });

        Schema::create('reclamacion_adjuntos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reclamacion_id')->constrained('reclamaciones')->cascadeOnDelete();
            $table->string('tipo', 15); // foto | comprobante | video
            $table->string('ruta'); // disco privado (storage/app/private)
            $table->string('nombre_original');
            $table->string('mime', 100);
            $table->unsignedInteger('tamano'); // bytes
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reclamacion_adjuntos');

        Schema::table('reclamaciones', function (Blueprint $table) {
            $table->dropColumn([
                'apoderado_tipo_documento', 'apoderado_numero_documento',
                'comprobante_tipo', 'comprobante_numero', 'fecha_compra', 'numero_contrato',
                'producto_codigo', 'producto_nombre', 'producto_marca', 'producto_modelo',
                'solucion_esperada', 'solucion_otra', 'declara_veracidad', 'acepta_datos', 'conforme',
            ]);
        });
    }
};
