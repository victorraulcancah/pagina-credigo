<?php

namespace App\Http\Middleware;

use App\Services\VisitaService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * Cuenta las visitas de las páginas públicas. Lo hace después de enviar la respuesta
 * (terminate), así la página no espera, y si algo falla el sitio sigue funcionando.
 *
 * No cuenta: buscadores y vistas previas, a quien está con sesión en el panel, las cargas
 * anticipadas (prefetch), las recargas parciales de Inertia ni las respuestas con error.
 */
class ContarVisita
{
    public function __construct(private VisitaService $visitas) {}

    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        if (! $this->seCuenta($request, $response)) {
            return;
        }

        try {
            $this->visitas->registrar((string) $request->ip(), (string) $request->userAgent());
        } catch (Throwable $error) {
            report($error);
        }
    }

    private function seCuenta(Request $request, Response $response): bool
    {
        $anticipada = str_contains(strtolower(implode(' ', [
            $request->header('Purpose'), $request->header('Sec-Purpose'), $request->header('X-Purpose'), $request->header('X-Moz'),
        ])), 'prefetch');

        return $request->isMethod('GET')
            && $response->getStatusCode() === 200
            && ! $anticipada
            && ! $request->hasHeader('X-Inertia-Partial-Data')
            && ! $request->user()
            && ! $this->visitas->esRobot($request->userAgent());
    }
}
