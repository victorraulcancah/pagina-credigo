<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\ConfiguracionRequest;
use App\Services\ConfiguracionService;
use Illuminate\Http\JsonResponse;

/** Ajustes del sitio: empresa y contacto, apariencia (colores, logo) y SEO. */
class ConfiguracionController extends BaseApiController
{
    public function __construct(private ConfiguracionService $configuracion) {}

    /** Ajustes + los colores de marca por defecto (para "Restablecer" en Apariencia). */
    public function show(): JsonResponse
    {
        return $this->successResponse($this->configuracion->paraPanel(), 'Configuración', extra: [
            'opciones' => [
                'colores_por_defecto' => [
                    'color_primario' => config('sitio.defaults.color_primario'),
                    'color_acento' => config('sitio.defaults.color_acento'),
                ],
            ],
        ]);
    }

    /** Guarda solo lo que llega (cada pantalla envía sus campos); las imágenes se reemplazan o se quitan. */
    public function update(ConfiguracionRequest $request): JsonResponse
    {
        $this->configuracion->guardar($request->validated());

        return $this->successResponse($this->configuracion->paraPanel(), 'Configuración guardada');
    }
}
