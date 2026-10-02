<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\PasswordRequest;
use App\Http\Requests\Admin\PerfilRequest;
use App\Services\PerfilService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Datos y contraseña del usuario que inició sesión en el panel. */
class PerfilController extends BaseApiController
{
    public function __construct(private PerfilService $perfil) {}

    public function show(Request $request): JsonResponse
    {
        return $this->successResponse($request->user()->only(['id', 'name', 'email']), 'Perfil');
    }

    public function update(PerfilRequest $request): JsonResponse
    {
        $usuario = $this->perfil->actualizar($request->user(), $request->validated());

        return $this->successResponse($usuario->only(['id', 'name', 'email']), 'Datos actualizados');
    }

    public function password(PasswordRequest $request): JsonResponse
    {
        $this->perfil->cambiarPassword($request->user(), $request->validated('password'));

        return $this->successResponse(null, 'Contraseña actualizada');
    }
}
