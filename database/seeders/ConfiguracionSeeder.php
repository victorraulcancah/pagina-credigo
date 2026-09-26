<?php

namespace Database\Seeders;

use App\Models\Configuracion;
use App\Services\ConfiguracionService;
use Illuminate\Database\Seeder;

/** Datos iniciales de la empresa. No pisa lo que ya se editó en el panel. */
class ConfiguracionSeeder extends Seeder
{
    public function run(): void
    {
        $valores = [
            'empresa_nombre' => 'CrediGo',
            'empresa_razon_social' => 'AREQUIPA GO S.A.C.',
            'empresa_ruc' => '20612112763',
            'empresa_eslogan' => 'Financiamiento para conductores de aplicativo',
            'empresa_descripcion' => 'Impulsamos a los conductores de Yango e InDrive con financiamiento vehicular, celulares y productos para su trabajo diario.',
            'contacto_telefono' => '993 570 000',
            'contacto_whatsapp' => '51993570000',
            'contacto_whatsapp_mensaje' => 'Hola, quiero información sobre CrediGo',
            'contacto_email' => 'contacto@credigo.com',
            'contacto_direccion' => 'Av. Paseo de la Cultura Mz. K Lt. 15, Urb. El Cóndor',
            'contacto_ciudad' => 'José Luis Bustamante y Rivero, Arequipa',
        ];

        foreach ($valores as $clave => $valor) {
            Configuracion::firstOrCreate(['clave' => $clave], ['valor' => $valor]);
        }

        app(ConfiguracionService::class)->limpiarCache();
    }
}
