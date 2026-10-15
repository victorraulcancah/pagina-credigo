<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Las estadísticas del sitio solo las lee otro sistema de la empresa (el ERP) con la clave
 * de ESTADISTICAS_TOKEN: `Authorization: Bearer {clave}`. Sin clave configurada, nadie entra.
 */
class VerificarClaveEstadisticas
{
    public function handle(Request $request, Closure $next): Response
    {
        $clave = (string) config('services.estadisticas.token');

        abort_if($clave === '' || ! hash_equals($clave, (string) $request->bearerToken()), 401, 'Clave de estadísticas no válida.');

        return $next($request);
    }
}
