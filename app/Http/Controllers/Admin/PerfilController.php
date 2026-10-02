<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

/** Pantalla de Mi perfil. Guardar va por la API: PUT /api/admin/perfil y /api/admin/perfil/password. */
class PerfilController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Admin/Perfil');
    }
}
