<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ServicioRequest;
use App\Models\Servicio;
use App\Services\ImagenService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ServicioController extends Controller
{
    private const CARPETA = 'servicios';

    public function __construct(private ImagenService $imagenes) {}

    public function index(): Response
    {
        return Inertia::render('Admin/Servicios/Index', [
            'servicios' => Servicio::ordenado()->get(),
        ]);
    }

    public function store(ServicioRequest $request): RedirectResponse
    {
        Servicio::create([
            ...$request->datos(),
            ...$this->imagenes->desdeFormulario($request, null, self::CARPETA),
        ]);

        Inertia::flash('success', 'Servicio creado');

        return back();
    }

    public function update(ServicioRequest $request, Servicio $servicio): RedirectResponse
    {
        $servicio->update([
            ...$request->datos(),
            ...$this->imagenes->desdeFormulario($request, $servicio->imagen, self::CARPETA),
        ]);

        Inertia::flash('success', 'Servicio actualizado');

        return back();
    }

    public function destroy(Servicio $servicio): RedirectResponse
    {
        $this->imagenes->eliminar($servicio->imagen);
        $servicio->delete();

        Inertia::flash('success', 'Servicio eliminado');

        return back();
    }
}
