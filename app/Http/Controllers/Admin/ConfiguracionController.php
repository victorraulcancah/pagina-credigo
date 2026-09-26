<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ConfiguracionRequest;
use App\Services\ConfiguracionService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ConfiguracionController extends Controller
{
    public function __construct(private ConfiguracionService $configuracion) {}

    /** Empresa, contacto y redes sociales. */
    public function empresa(): Response
    {
        return Inertia::render('Admin/Configuracion/Empresa', [
            'ajustes' => $this->configuracion->publicas(),
        ]);
    }

    /** Colores, logo y favicon. */
    public function apariencia(): Response
    {
        return Inertia::render('Admin/Configuracion/Apariencia', [
            'ajustes' => $this->configuracion->publicas(),
            'coloresPorDefecto' => [
                'color_primario' => config('sitio.defaults.color_primario'),
                'color_acento' => config('sitio.defaults.color_acento'),
            ],
        ]);
    }

    public function update(ConfiguracionRequest $request): RedirectResponse
    {
        $imagenes = config('sitio.imagenes');

        $this->configuracion->actualizar($request->safe()->except([
            ...$imagenes,
            ...array_map(fn ($clave) => "quitar_{$clave}", $imagenes),
        ]));

        foreach ($imagenes as $clave) {
            if ($request->hasFile($clave)) {
                $this->configuracion->actualizarImagen($clave, $request->file($clave));
            } elseif ($request->boolean("quitar_{$clave}")) {
                $this->configuracion->quitarImagen($clave);
            }
        }

        Inertia::flash('success', 'Configuración guardada');

        return back();
    }
}
