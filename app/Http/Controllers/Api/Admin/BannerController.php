<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\BannerRequest;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use App\Services\BannerService;
use Illuminate\Http\JsonResponse;

class BannerController extends BaseApiController
{
    public function __construct(private BannerService $banners) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(BannerResource::collection($this->banners->listar()), 'Banners');
    }

    public function show(Banner $banner): JsonResponse
    {
        return $this->successResponse(new BannerResource($banner), 'Banner');
    }

    public function store(BannerRequest $request): JsonResponse
    {
        return $this->createdResponse(new BannerResource($this->banners->crear($request->validated())), 'Banner creado');
    }

    public function update(BannerRequest $request, Banner $banner): JsonResponse
    {
        return $this->successResponse(new BannerResource($this->banners->actualizar($banner, $request->validated())), 'Banner actualizado');
    }

    public function destroy(Banner $banner): JsonResponse
    {
        $this->banners->eliminar($banner);

        return $this->successResponse(null, 'Banner eliminado');
    }
}
