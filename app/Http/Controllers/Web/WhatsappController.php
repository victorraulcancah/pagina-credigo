<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\WhatsappRequest;
use App\Services\WhatsappService;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * /whatsapp?texto=… → WhatsApp de la empresa con ese mensaje ya escrito. Lo usan los botones
 * del panel ("WhatsApp con mensaje"): el número sale de Empresa y contacto, así que si cambia,
 * los botones siguen funcionando. Sin WhatsApp configurado lleva a Soporte.
 */
class WhatsappController extends Controller
{
    public function __invoke(WhatsappRequest $request, WhatsappService $whatsapp): Response
    {
        // Inertia::location también sirve si el clic vino de un <Link> (lo abre fuera de la app)
        return Inertia::location($whatsapp->enlace($request->validated('texto')) ?? url('/soporte'));
    }
}
