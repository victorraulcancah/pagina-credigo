<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PreguntaFrecuenteRequest;
use App\Models\PreguntaFrecuente;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PreguntaFrecuenteController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Preguntas/Index', [
            'preguntas' => PreguntaFrecuente::ordenado()->get(),
        ]);
    }

    public function store(PreguntaFrecuenteRequest $request): RedirectResponse
    {
        PreguntaFrecuente::create($request->validated());

        Inertia::flash('success', 'Pregunta creada');

        return back();
    }

    public function update(PreguntaFrecuenteRequest $request, PreguntaFrecuente $pregunta): RedirectResponse
    {
        $pregunta->update($request->validated());

        Inertia::flash('success', 'Pregunta actualizada');

        return back();
    }

    public function destroy(PreguntaFrecuente $pregunta): RedirectResponse
    {
        $pregunta->delete();

        Inertia::flash('success', 'Pregunta eliminada');

        return back();
    }
}
