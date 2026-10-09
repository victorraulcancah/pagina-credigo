<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * La inicial puede ir en otra moneda que las cuotas (ej. inicial en US$ y cuotas
 * semanales en S/): `moneda` queda como la moneda de la cuota y `moneda_inicial`
 * es la de la inicial o inscripción.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('opciones_plan', function (Blueprint $table) {
            $table->string('moneda_inicial', 3)->default('PEN')->after('moneda'); // PEN | USD
        });

        // Hasta ahora la inicial iba en la misma moneda que la cuota
        DB::table('opciones_plan')->update(['moneda_inicial' => DB::raw('moneda')]);

        // Las opciones traídas del ERP con la inicial en otra moneda la tenían solo en la
        // nota ("Certificado de 54,000 · Inicial US$ 2,500"): pasa a sus campos
        DB::table('opciones_plan')->whereNotNull('erp_ref')->whereNull('inicial')->whereNotNull('nota')->get(['id', 'nota'])
            ->each(function ($opcion) {
                if (! preg_match('/(?:^| · )Inicial (US\$|S\/) ([\d,]+(?:\.\d+)?)/u', $opcion->nota, $coincidencia)) {
                    return;
                }

                $nota = trim(preg_replace('/^ · | · $/u', '', str_replace($coincidencia[0], '', $opcion->nota)));

                DB::table('opciones_plan')->where('id', $opcion->id)->update([
                    'moneda_inicial' => $coincidencia[1] === 'US$' ? 'USD' : 'PEN',
                    'inicial' => (float) str_replace(',', '', $coincidencia[2]),
                    'nota' => $nota !== '' ? $nota : null,
                ]);
            });
    }

    public function down(): void
    {
        Schema::table('opciones_plan', function (Blueprint $table) {
            $table->dropColumn('moneda_inicial');
        });
    }
};
