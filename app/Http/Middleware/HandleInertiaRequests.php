<?php

namespace App\Http\Middleware;

use App\Models\MensajeContacto;
use App\Models\Reclamacion;
use App\Services\ConfiguracionService;
use App\Services\ServicioService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            // Ajustes del sitio (empresa, contacto, redes, colores, logo) editables en /admin
            'sitio' => fn () => app(ConfiguracionService::class)->publicas(),
            'auth' => [
                'user' => fn () => $request->user()?->only(['id', 'name', 'email']),
            ],
            // Planes del menú "Planes" del sitio público (cada uno lleva a su página)
            'planesMenu' => fn () => $request->is('admin', 'admin/*') ? [] : app(ServicioService::class)->paraMenu(),
            'mensajesNoLeidos' => fn () => $request->user() ? MensajeContacto::noLeido()->count() : 0,
            'reclamacionesPendientes' => fn () => $request->user() ? Reclamacion::pendiente()->count() : 0,
        ];
    }
}
