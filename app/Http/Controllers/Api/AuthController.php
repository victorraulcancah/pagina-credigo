<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Login y logout del panel por la API.
 * POST /api/login · POST /api/logout · el usuario actual: GET /api/admin/perfil
 */
class AuthController extends BaseApiController
{
    public function __construct(private AuthService $auth) {}

    /**
     * Desde el navegador del panel inicia la sesión (cookie) y devuelve a dónde ir.
     * Desde una app u otro sistema (sin sesión) devuelve un token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $request->verificarIntentos();

        $usuario = $this->auth->verificarCredenciales($request->validated('email'), $request->validated('password'))
            ?? $request->rechazar();

        $request->limpiarIntentos();
        $datos = $usuario->only(['id', 'name', 'email']);

        if ($request->hasSession()) {
            $this->auth->iniciarSesion($usuario, $request->boolean('remember'), $request->session());

            return $this->successResponse($datos, 'Sesión iniciada', extra: [
                'redirect' => $request->session()->pull('url.intended', '/admin'),
            ]);
        }

        return $this->successResponse($datos, 'Sesión iniciada', extra: [
            'token' => $this->auth->crearToken($usuario, $request->validated('dispositivo') ?? 'api'),
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->auth->cerrarSesion($request->user(), $request->hasSession() ? $request->session() : null);

        return $this->successResponse(['redirect' => '/login'], 'Sesión cerrada');
    }
}
