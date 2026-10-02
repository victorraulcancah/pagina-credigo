<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SeccionRequest;
use App\Models\Seccion;
use App\Services\ImagenService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Las secciones son fijas (las crea el seeder porque cada una tiene su lugar
 * en una página); desde el panel solo se editan o se ocultan.
 */
class SeccionController extends Controller
{
    private const CAMPOS_TEXTO = ['subtitulo', 'titulo', 'contenido'];

    private const ORDEN_PAGINAS = ['inicio', 'nosotros', 'servicios', 'requisitos', 'pagos', 'talleres', 'beneficios', 'cotizador', 'contacto', 'general', 'legal'];

    public function __construct(private ImagenService $imagenes) {}

    public function index(): Response
    {
        return Inertia::render('Admin/Secciones/Index', [
            'secciones' => Seccion::ordenado()
                ->get(['id', 'pagina', 'clave', 'nombre', 'titulo', 'activo', 'updated_at'])
                ->sortBy(fn (Seccion $seccion) => array_search($seccion->pagina, self::ORDEN_PAGINAS))
                ->values(),
        ]);
    }

    public function edit(Seccion $seccion): Response
    {
        return Inertia::render('Admin/Secciones/Edit', [
            'seccion' => $seccion,
        ]);
    }

    public function update(SeccionRequest $request, Seccion $seccion): RedirectResponse
    {
        $datos = ['activo' => $request->boolean('activo')];

        foreach (self::CAMPOS_TEXTO as $campo) {
            if ($seccion->usaCampo($campo)) {
                $datos[$campo] = $request->validated($campo);
            }
        }

        if ($seccion->usaCampo('boton')) {
            $datos['boton_texto'] = $request->validated('boton_texto');
            $datos['boton_url'] = $request->validated('boton_url');
        }

        if ($seccion->usaCampo('video')) {
            $datos['video_url'] = $request->validated('video_url');
        }

        if ($seccion->usaCampo('items')) {
            // Si se borran todos los elementos, el campo no llega en el formulario
            $datos['items'] = array_values($request->validated('items') ?? []);
        }

        if ($seccion->usaCampo('imagen')) {
            $datos = [...$datos, ...$this->imagenes->desdeFormulario($request, $seccion->imagen, 'secciones')];
        }

        $seccion->update($datos);

        Inertia::flash('success', 'Sección actualizada');

        return back();
    }
}
