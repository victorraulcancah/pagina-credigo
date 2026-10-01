<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Seccion;
use App\Models\Servicio;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;

/** sitemap.xml y robots.txt generados (usan la URL del sitio del .env). */
class SeoController extends Controller
{
    public function sitemap(): Response
    {
        $ultimaEdicion = fn (array $paginas) => Seccion::whereIn('pagina', $paginas)->max('updated_at');
        $serviciosEditados = Servicio::max('updated_at');

        $paginas = [
            ['/', 1.0, max($ultimaEdicion(['inicio', 'general']), $serviciosEditados)],
            ['/servicios', 0.9, max($ultimaEdicion(['servicios']), $serviciosEditados)],
            ['/cotizador', 0.9, max($ultimaEdicion(['cotizador']), $serviciosEditados)],
            ['/requisitos', 0.8, $ultimaEdicion(['requisitos'])],
            ['/como-pagar', 0.7, $ultimaEdicion(['pagos'])],
            ['/talleres', 0.7, $ultimaEdicion(['talleres'])],
            ['/beneficios', 0.7, $ultimaEdicion(['beneficios'])],
            ['/nosotros', 0.8, $ultimaEdicion(['nosotros', 'general'])],
            ['/soporte', 0.8, $ultimaEdicion(['contacto'])],
            ['/libro-de-reclamaciones', 0.3, null],
            ['/terminos-y-condiciones', 0.2, $ultimaEdicion(['legal'])],
            ['/politica-de-privacidad', 0.2, $ultimaEdicion(['legal'])],
        ];

        $urls = collect($paginas)->map(function ($pagina) {
            [$ruta, $prioridad, $modificado] = $pagina;
            $lastmod = $modificado ? '<lastmod>'.Carbon::parse($modificado)->toDateString().'</lastmod>' : '';

            return '<url><loc>'.e(url($ruta))."</loc>{$lastmod}<priority>{$prioridad}</priority></url>";
        })->implode("\n");

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n{$urls}\n</urlset>";

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    public function robots(): Response
    {
        $contenido = implode("\n", [
            'User-agent: *',
            'Disallow: /admin',
            'Disallow: /login',
            'Disallow: /libro-de-reclamaciones/constancia',
            '',
            'Sitemap: '.url('/sitemap.xml'),
        ]);

        return response($contenido, 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }
}
