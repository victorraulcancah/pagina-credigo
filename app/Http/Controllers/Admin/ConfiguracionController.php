<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ConfiguracionService;
use Inertia\Inertia;
use Inertia\Response;

/** Pantallas de configuración. Guardar va por la API: PUT /api/admin/configuracion. */
class ConfiguracionController extends Controller
{
    public function __construct(private ConfiguracionService $configuracion) {}

    /** Empresa, contacto, redes sociales y correos de avisos. */
    public function empresa(): Response
    {
        return Inertia::render('Admin/Configuracion/Empresa', [
            'ajustes' => $this->configuracion->paraPanel(),
        ]);
    }

    /** Vista previa al compartir, Google Analytics y píxel de Meta. */
    public function seo(): Response
    {
        return Inertia::render('Admin/Configuracion/Seo', [
            'ajustes' => $this->configuracion->paraPanel(),
        ]);
    }

    /** Colores, logo y favicon. */
    public function apariencia(): Response
    {
        return Inertia::render('Admin/Configuracion/Apariencia', [
            'ajustes' => $this->configuracion->paraPanel(),
            'coloresPorDefecto' => [
                'color_primario' => config('sitio.defaults.color_primario'),
                'color_acento' => config('sitio.defaults.color_acento'),
            ],
        ]);
    }
}
