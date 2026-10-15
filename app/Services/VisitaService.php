<?php

namespace App\Services;

use App\Models\VisitaDiaria;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * Contador de visitas del sitio público.
 *
 * Una "visita" es una persona distinta en un día; una "página vista" es cada página que abre.
 * No se guarda la IP ni se usan cookies: para no contar dos veces a alguien se guarda una
 * huella irreversible que cambia cada día y se borra al día siguiente.
 */
class VisitaService
{
    // Los días se cuentan con la hora de Perú (el servidor trabaja en UTC)
    public const ZONA = 'America/Lima';

    private const ROBOTS = '/bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|preview|monitor|uptime|pingdom|lighthouse|headless|curl|wget|python|postman|axios|guzzle|okhttp|java\/|go-http/i';

    public function hoy(): CarbonImmutable
    {
        return CarbonImmutable::now(self::ZONA)->startOfDay();
    }

    /** Buscadores, vistas previas de WhatsApp/Facebook, monitores y programas: no son personas. */
    public function esRobot(?string $navegador): bool
    {
        return blank($navegador) || preg_match(self::ROBOTS, $navegador) === 1;
    }

    /** Suma una página vista y, si esa persona no había entrado hoy, también una visita. */
    public function registrar(string $ip, string $navegador): void
    {
        $fecha = $this->hoy()->toDateString();
        $huella = hash('sha256', implode('|', [$fecha, $ip, $navegador, config('app.key')]));

        $esNueva = DB::table('visitantes_dia')->insertOrIgnore(['fecha' => $fecha, 'huella' => $huella]) > 0;
        $visitas = $esNueva ? 1 : 0;

        // Una sola sentencia: no se pierden visitas aunque entren varias personas a la vez
        DB::table('visitas_diarias')->upsert(
            [['fecha' => $fecha, 'visitas' => $visitas, 'paginas_vistas' => 1]],
            ['fecha'],
            [
                'visitas' => DB::raw("visitas + {$visitas}"),
                'paginas_vistas' => DB::raw('paginas_vistas + 1'),
            ],
        );
    }

    /**
     * Resumen para el dashboard del ERP: hoy, ayer, últimos 7 y 30 días, el mes, el total
     * y la serie día a día (los días sin visitas salen en cero).
     */
    public function resumen(int $dias = 30): array
    {
        $hoy = $this->hoy();
        $porDia = VisitaDiaria::query()
            ->where('fecha', '>=', $hoy->subDays(max($dias, 31))->toDateString())
            ->get()
            ->keyBy(fn (VisitaDiaria $dia) => substr((string) $dia->fecha, 0, 10));

        $dia = fn (CarbonImmutable $fecha) => [
            'visitas' => $porDia->get($fecha->toDateString())?->visitas ?? 0,
            'paginas_vistas' => $porDia->get($fecha->toDateString())?->paginas_vistas ?? 0,
        ];

        $desde = fn (CarbonImmutable $inicio) => $this->suma(
            $porDia->filter(fn ($d, string $fecha) => $fecha >= $inicio->toDateString()),
        );

        $total = VisitaDiaria::query()
            ->selectRaw('COALESCE(SUM(visitas), 0) as visitas, COALESCE(SUM(paginas_vistas), 0) as paginas_vistas, MIN(fecha) as desde')
            ->toBase()
            ->first();

        return [
            'hoy' => $dia($hoy),
            'ayer' => $dia($hoy->subDay()),
            'ultimos_7_dias' => $desde($hoy->subDays(6)),
            'ultimos_30_dias' => $desde($hoy->subDays(29)),
            'mes_actual' => $desde($hoy->startOfMonth()),
            'total' => ['visitas' => (int) $total->visitas, 'paginas_vistas' => (int) $total->paginas_vistas],
            // Primer día con datos: desde cuándo se cuenta
            'desde' => $total->desde ? substr((string) $total->desde, 0, 10) : null,
            'serie' => collect(range($dias - 1, 0))
                ->map(fn (int $atras) => ['fecha' => $hoy->subDays($atras)->toDateString(), ...$dia($hoy->subDays($atras))])
                ->all(),
            'actualizado' => now()->toIso8601String(),
        ];
    }

    /** Borra las huellas de días anteriores (ya no hacen falta). Devuelve cuántas borró. */
    public function limpiarHuellas(): int
    {
        return DB::table('visitantes_dia')->where('fecha', '<', $this->hoy()->toDateString())->delete();
    }

    private function suma(iterable $dias): array
    {
        $visitas = $paginas = 0;

        foreach ($dias as $dia) {
            $visitas += $dia->visitas;
            $paginas += $dia->paginas_vistas;
        }

        return ['visitas' => $visitas, 'paginas_vistas' => $paginas];
    }
}
