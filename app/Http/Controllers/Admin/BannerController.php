<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BannerResource;
use App\Services\BannerService;
use Inertia\Inertia;
use Inertia\Response;

/** Pantalla de Banners. Crear, editar y eliminar van por la API: /api/admin/banners. */
class BannerController extends Controller
{
    public function index(BannerService $banners): Response
    {
        return Inertia::render('Admin/Banners/Index', [
            'banners' => BannerResource::collection($banners->listar())->resolve(),
        ]);
    }
}
