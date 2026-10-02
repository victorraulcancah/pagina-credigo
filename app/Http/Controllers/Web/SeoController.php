<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\SeoService;
use Illuminate\Http\Response;

/** sitemap.xml y robots.txt: los buscadores los piden en la raíz del sitio, no en /api. */
class SeoController extends Controller
{
    public function __construct(private SeoService $seo) {}

    public function sitemap(): Response
    {
        return response($this->seo->sitemap(), 200, ['Content-Type' => 'application/xml']);
    }

    public function robots(): Response
    {
        return response($this->seo->robots(), 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }
}
