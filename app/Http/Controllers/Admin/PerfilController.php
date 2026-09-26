<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PasswordRequest;
use App\Http\Requests\Admin\PerfilRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PerfilController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Admin/Perfil');
    }

    public function update(PerfilRequest $request): RedirectResponse
    {
        $request->user()->update($request->validated());

        Inertia::flash('success', 'Datos actualizados');

        return back();
    }

    public function password(PasswordRequest $request): RedirectResponse
    {
        $request->user()->update(['password' => $request->validated('password')]);

        Inertia::flash('success', 'Contraseña actualizada');

        return back();
    }
}
