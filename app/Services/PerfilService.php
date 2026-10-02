<?php

namespace App\Services;

use App\Models\User;

/** Datos y contraseña del usuario del panel. */
class PerfilService
{
    public function actualizar(User $usuario, array $datos): User
    {
        $usuario->update($datos);

        return $usuario->refresh();
    }

    /** La contraseña se guarda cifrada (cast "hashed" del modelo). */
    public function cambiarPassword(User $usuario, string $password): void
    {
        $usuario->update(['password' => $password]);
    }
}
