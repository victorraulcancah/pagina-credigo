<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\ListarSeccionesRequest;
use App\Http\Resources\BannerResource;
use App\Http\Resources\PreguntaFrecuenteResource;
use App\Services\BannerService;
use App\Services\ConfiguracionService;
use App\Services\PreguntaFrecuenteService;
use App\Services\SeccionService;
use App\Services\ServicioService;
use Illuminate\Http\JsonResponse;

/** Contenido público del sitio (solo lectura): ajustes, secciones, banners y preguntas frecuentes. */
class SitioController extends BaseApiController
{
    /** Empresa, contacto, redes, colores y logo (sin los ajustes privados). */
    public function ajustes(ConfiguracionService $configuracion): JsonResponse
    {
        return $this->successResponse($configuracion->publicas(), 'Ajustes del sitio');
    }

    /** Secciones activas de las páginas pedidas, indexadas por "pagina.clave". */
    public function secciones(ListarSeccionesRequest $request, SeccionService $secciones): JsonResponse
    {
        return $this->successResponse($secciones->publicas($request->paginas()), 'Secciones');
    }

    /** Planes visibles para el menú "Planes" del sitio (cada uno lleva a su página). */
    public function menu(ServicioService $servicios): JsonResponse
    {
        return $this->successResponse(['planes' => $servicios->paraMenu()], 'Menú');
    }

    public function banners(BannerService $banners): JsonResponse
    {
        return $this->successResponse(BannerResource::collection($banners->activos()), 'Banners');
    }

    public function preguntas(PreguntaFrecuenteService $preguntas): JsonResponse
    {
        return $this->successResponse(PreguntaFrecuenteResource::collection($preguntas->activas()), 'Preguntas frecuentes');
    }
}
