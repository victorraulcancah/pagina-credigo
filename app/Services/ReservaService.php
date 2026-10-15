<?php

namespace App\Services;

use App\Mail\NuevaReserva;
use App\Models\Reserva;
use App\Models\TipoReserva;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;

/** Reservas de la web (/reservar): se guardan, avisan al equipo y se siguen en el panel. */
class ReservaService
{
    public const ZONA = 'America/Lima';

    public const POR_PAGINA = 15;

    public function __construct(private AvisoEquipoService $aviso, private WhatsappService $whatsapp) {}

    /**
     * Guarda la reserva y avisa al equipo por correo.
     * Si llenaron el campo oculto (`website`) es un bot: no se guarda, pero se responde igual.
     */
    public function registrar(array $datos, ?string $ip): ?Reserva
    {
        if (filled($datos['website'] ?? null)) {
            return null;
        }

        $tipo = TipoReserva::findOrFail($datos['tipo_reserva_id']);

        $reserva = Reserva::create([
            ...Arr::except($datos, ['website', 'acepta_politica']),
            ...$this->ruta($tipo, $datos),
            'tipo' => $tipo->nombre,
            'estado' => 'pendiente',
            'ip' => $ip,
        ]);

        $this->aviso->enviar(new NuevaReserva($reserva));

        return $reserva;
    }

    /** WhatsApp de la empresa con la reserva ya escrita, para que el cliente la envíe (null sin WhatsApp). */
    public function enlaceWhatsapp(array $datos): ?string
    {
        $tipo = TipoReserva::find($datos['tipo_reserva_id']);
        $ruta = $tipo ? $this->ruta($tipo, $datos) : [];
        $hora = filled($datos['hora'] ?? null) ? " a las {$datos['hora']}" : '';

        $lineas = [
            'Hola, quiero hacer una reserva'.($tipo ? " ({$tipo->nombre})" : '').'.',
            filled($ruta['origen'] ?? null) ? "Desde: {$ruta['origen']}" : null,
            filled($ruta['destino'] ?? null) ? "Hasta: {$ruta['destino']}" : null,
            'Fecha: '.$this->fechaLegible($datos['fecha']).$hora,
            filled($ruta['pasajeros'] ?? null) ? "Pasajeros: {$ruta['pasajeros']}" : null,
            "A nombre de: {$datos['nombre']} ({$datos['telefono']})",
            filled($datos['comentario'] ?? null) ? "Comentario: {$datos['comentario']}" : null,
        ];

        return $this->whatsapp->enlace(implode("\n", array_filter($lineas)));
    }

    /** "2026-10-20" → "lunes 20 de octubre" */
    public function fechaLegible(string $fecha): string
    {
        return Carbon::parse($fecha, self::ZONA)->locale('es')->isoFormat('dddd D [de] MMMM');
    }

    /** Filtros de la lista con sus valores por defecto. */
    public function filtrosPorDefecto(array $filtros): array
    {
        return [
            'buscar' => $filtros['buscar'] ?? '',
            'estado' => $filtros['estado'] ?? 'todos',
            'tipo' => $filtros['tipo'] ?? 'todos',
        ];
    }

    public function paginar(array $filtros): LengthAwarePaginator
    {
        return Reserva::query()->filtrar($filtros)->latest()->paginate(self::POR_PAGINA)->withQueryString();
    }

    /** Cantidad por estado (respeta los demás filtros, no el de estado). */
    public function conteos(array $filtros): array
    {
        return Reserva::query()
            ->filtrar([...$filtros, 'estado' => 'todos'])
            ->selectRaw('estado, count(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado')
            ->all();
    }

    /** Guarda el estado y las notas internas. */
    public function seguimiento(Reserva $reserva, array $datos): Reserva
    {
        $reserva->update($datos);

        return $reserva->refresh();
    }

    public function eliminar(Reserva $reserva): void
    {
        $reserva->delete();
    }

    /** Origen, destino y pasajeros solo si el tipo los pide (ej. no en una cita). */
    private function ruta(TipoReserva $tipo, array $datos): array
    {
        return [
            'origen' => $tipo->pide_ruta ? ($datos['origen'] ?? null) : null,
            'destino' => $tipo->pide_ruta ? ($datos['destino'] ?? null) : null,
            'pasajeros' => $tipo->pide_ruta ? ($datos['pasajeros'] ?? null) : null,
        ];
    }
}
