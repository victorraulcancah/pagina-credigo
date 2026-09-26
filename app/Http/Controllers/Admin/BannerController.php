<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BannerRequest;
use App\Models\Banner;
use App\Services\ImagenService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    private const CARPETA = 'banners';

    public function __construct(private ImagenService $imagenes) {}

    public function index(): Response
    {
        return Inertia::render('Admin/Banners/Index', [
            'banners' => Banner::ordenado()->get(),
        ]);
    }

    public function store(BannerRequest $request): RedirectResponse
    {
        Banner::create($this->datos($request));

        Inertia::flash('success', 'Banner creado');

        return back();
    }

    public function update(BannerRequest $request, Banner $banner): RedirectResponse
    {
        $banner->update($this->datos($request, $banner));

        Inertia::flash('success', 'Banner actualizado');

        return back();
    }

    public function destroy(Banner $banner): RedirectResponse
    {
        $this->imagenes->eliminar($banner->imagen);
        $this->imagenes->eliminar($banner->imagen_movil);
        $banner->delete();

        Inertia::flash('success', 'Banner eliminado');

        return back();
    }

    /** Datos del formulario + las dos imágenes (escritorio y celular). */
    private function datos(BannerRequest $request, ?Banner $banner = null): array
    {
        return [
            ...$request->safe()->except(['imagen', 'quitar_imagen', 'imagen_movil', 'quitar_imagen_movil']),
            ...$this->imagenes->desdeFormulario($request, $banner?->imagen, self::CARPETA),
            ...$this->imagenes->desdeFormulario($request, $banner?->imagen_movil, self::CARPETA, 'imagen_movil'),
        ];
    }
}
