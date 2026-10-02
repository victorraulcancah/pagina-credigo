<?php

namespace App\Services;

use App\Models\Banner;
use App\Models\MensajeContacto;
use App\Models\PreguntaFrecuente;
use App\Models\Reclamacion;
use App\Models\Servicio;
use App\Services\Erp\CatalogosErp;
use Illuminate\Database\Eloquent\Collection;

/** Resumen del inicio del panel: pendientes, contenido publicado y estado del ERP. */
class DashboardService
{
    public function __construct(private CatalogosErp $catalogos) {}

    public function resumen(): array
    {
        return [
            'solicitudes_nuevas' => MensajeContacto::where('estado', 'nuevo')->count(),
            'reclamaciones_pendientes' => Reclamacion::pendiente()->count(),
            'mensajes_total' => MensajeContacto::count(),
            'servicios_activos' => Servicio::activo()->count(),
            'banners_activos' => Banner::activo()->count(),
            'preguntas_activas' => PreguntaFrecuente::activo()->count(),
        ];
    }

    /** Para el menú del panel. */
    public function contadores(): array
    {
        return [
            'mensajes_no_leidos' => MensajeContacto::noLeido()->count(),
            'reclamaciones_pendientes' => Reclamacion::pendiente()->count(),
        ];
    }

    public function erp(): array
    {
        return [
            'configurado' => (bool) config('services.erp.url'),
            'catalogos' => $this->catalogos->estado(),
        ];
    }

    public function ultimasSolicitudes(int $cantidad = 5): Collection
    {
        return MensajeContacto::latest()->limit($cantidad)->get();
    }
}
