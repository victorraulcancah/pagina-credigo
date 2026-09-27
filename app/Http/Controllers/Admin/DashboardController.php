<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\MensajeContacto;
use App\Models\PreguntaFrecuente;
use App\Models\Reclamacion;
use App\Models\Servicio;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'resumen' => [
                'solicitudes_nuevas' => MensajeContacto::where('estado', 'nuevo')->count(),
                'reclamaciones_pendientes' => Reclamacion::pendiente()->count(),
                'mensajes_total' => MensajeContacto::count(),
                'servicios_activos' => Servicio::activo()->count(),
                'banners_activos' => Banner::activo()->count(),
                'preguntas_activas' => PreguntaFrecuente::activo()->count(),
            ],
            'ultimosMensajes' => MensajeContacto::latest()->limit(5)->get(),
        ]);
    }
}
