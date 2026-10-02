<?php

namespace App\Services;

use App\Mail\NuevaSolicitud;
use App\Models\MensajeContacto;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/** Solicitudes que llegan de la web (soporte y cotizador) y su seguimiento tipo CRM en el panel. */
class SolicitudService
{
    public const POR_PAGINA = 15;

    public function __construct(private AvisoEquipoService $aviso) {}

    /**
     * Registra la solicitud y avisa al equipo por correo.
     * Si llenaron el campo oculto (`website`) es un bot: no se guarda, pero se responde igual.
     */
    public function registrar(array $datos, ?string $ip): ?MensajeContacto
    {
        if (filled($datos['website'] ?? null)) {
            return null;
        }

        $mensaje = MensajeContacto::create([
            ...collect($datos)->except(['website', 'acepta_politica'])->all(),
            'origen' => $datos['origen'] ?? 'contacto',
            'ip' => $ip,
        ]);

        $this->aviso->enviar(new NuevaSolicitud($mensaje));

        return $mensaje;
    }

    /** Filtros de la bandeja con sus valores por defecto. */
    public function filtrosPorDefecto(array $filtros): array
    {
        return [
            'buscar' => $filtros['buscar'] ?? '',
            'estado' => $filtros['estado'] ?? 'todos',
            'origen' => $filtros['origen'] ?? 'todos',
            'asignado' => $filtros['asignado'] ?? 'todos',
        ];
    }

    public function paginar(array $filtros, int $usuarioId): LengthAwarePaginator
    {
        return MensajeContacto::query()
            ->with('asignado:id,name')
            ->filtrar($filtros, $usuarioId)
            ->latest()
            ->paginate(self::POR_PAGINA)
            ->withQueryString();
    }

    /** Cantidad por estado (respeta los demás filtros, no el de estado). */
    public function conteos(array $filtros, int $usuarioId): array
    {
        return MensajeContacto::query()
            ->filtrar([...$filtros, 'estado' => 'todos'], $usuarioId)
            ->selectRaw('estado, count(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado')
            ->all();
    }

    /** Todas las que cumplen los filtros (para el Excel). */
    public function paraExportar(array $filtros, int $usuarioId): Collection
    {
        return MensajeContacto::query()->with('asignado:id,name')->filtrar($filtros, $usuarioId)->latest()->get();
    }

    /** Guarda estado, asesor asignado y notas internas; abrirla la marca como leída. */
    public function seguimiento(MensajeContacto $mensaje, array $datos): MensajeContacto
    {
        $mensaje->update([...$datos, 'leido_at' => $mensaje->leido_at ?? now()]);

        return $mensaje->refresh()->load('asignado:id,name');
    }

    public function marcarLeido(MensajeContacto $mensaje, bool $leido): MensajeContacto
    {
        $mensaje->update(['leido_at' => $leido ? ($mensaje->leido_at ?? now()) : null]);

        return $mensaje->refresh();
    }

    public function eliminar(MensajeContacto $mensaje): void
    {
        $mensaje->delete();
    }
}
