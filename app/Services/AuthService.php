<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Contracts\Session\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * Inicio y cierre de sesión del panel por la API.
 * - Desde el navegador (mismo dominio): sesión con cookie (Sanctum SPA), sin tokens guardados en el navegador.
 * - Desde una app u otro sistema: token de Sanctum (Authorization: Bearer ...).
 */
class AuthService
{
    /** El usuario si el correo y la contraseña coinciden; null si no. */
    public function verificarCredenciales(string $email, string $password): ?User
    {
        $usuario = User::where('email', $email)->first();

        return $usuario && Hash::check($password, $usuario->password) ? $usuario : null;
    }

    /** Sesión del navegador: entra y cambia el id de sesión (evita fijación de sesión). */
    public function iniciarSesion(User $usuario, bool $recordar, Session $sesion): void
    {
        Auth::guard('web')->login($usuario, $recordar);
        $sesion->regenerate();
    }

    /** Token para una app u otro sistema. */
    public function crearToken(User $usuario, string $dispositivo): string
    {
        return $usuario->createToken($dispositivo)->plainTextToken;
    }

    /** Cierra la sesión del navegador y/o revoca el token con el que se llamó. */
    public function cerrarSesion(User $usuario, ?Session $sesion): void
    {
        $token = $usuario->currentAccessToken();
        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        if ($sesion) {
            Auth::guard('web')->logout();
            $sesion->invalidate();
            $sesion->regenerateToken();
        }
    }
}
