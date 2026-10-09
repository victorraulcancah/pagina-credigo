<?php

namespace App\Services;

use App\Models\OpcionPlan;
use App\Models\Servicio;
use Illuminate\Database\Eloquent\Collection;

/** Planes y servicios: los del panel, los del sitio (con su "cuota desde") y la página de cada plan. */
class ServicioService
{
    private const CARPETA = 'servicios';

    /** Columnas de las opciones que necesita la web para "Cuota desde" y la tabla del plan */
    private const COLUMNAS_OPCION = ['id', 'servicio_id', 'nombre', 'nota', 'moneda', 'moneda_inicial', 'inicial', 'cuota', 'numero_cuotas', 'frecuencia'];

    public function __construct(private ImagenService $imagenes) {}

    public function listar(): Collection
    {
        return Servicio::ordenado()->get();
    }

    /** Planes visibles con sus opciones visibles (para "Cuota desde") y cuántas tienen (Cotizar o Consultar). */
    public function visibles(bool $soloDestacados = false): Collection
    {
        return Servicio::activo()
            ->when($soloDestacados, fn ($q) => $q->destacado())
            ->conOpcionesActivas()
            ->ordenado()
            ->with(['opciones' => fn ($q) => $q->activo()->ordenado()->select(self::COLUMNAS_OPCION)])
            ->get();
    }

    /** Planes del cotizador: los visibles que tienen al menos una opción visible. */
    public function cotizables(): Collection
    {
        return Servicio::activo()
            ->whereHas('opciones', fn ($q) => $q->activo())
            ->with(['opciones' => fn ($q) => $q->activo()->ordenado()])
            ->ordenado()
            ->get();
    }

    /** Planes del menú "Planes" del sitio. */
    public function paraMenu(int $limite = 8): Collection
    {
        return Servicio::activo()->ordenado()->limit($limite)->get(['titulo', 'slug']);
    }

    /** Plan visible por su dirección, con sus opciones visibles; null si no existe o está oculto. */
    public function publicoPorSlug(string $slug): ?Servicio
    {
        return Servicio::activo()
            ->where('slug', $slug)
            ->conOpcionesActivas()
            ->with(['opciones' => fn ($q) => $q->activo()->ordenado()->select(self::COLUMNAS_OPCION)])
            ->first();
    }

    /** Los demás planes visibles (para comparar desde la página de un plan). */
    public function otros(Servicio $servicio): Collection
    {
        return Servicio::activo()->whereKeyNot($servicio->id)->ordenado()->get(['id', 'titulo', 'slug', 'etiqueta', 'descripcion', 'icono']);
    }

    /** Cuota semanal más baja de las opciones visibles (prefiere soles); null si no hay montos. */
    public function cuotaSemanalMasBaja(): ?array
    {
        $opcion = OpcionPlan::activo()
            ->where('frecuencia', 'semanal')
            ->whereNotNull('cuota')
            ->whereHas('servicio', fn ($q) => $q->activo())
            ->orderByRaw("moneda = 'PEN' desc")
            ->orderBy('cuota')
            ->first(['cuota', 'moneda']);

        return $opcion ? ['cuota' => $opcion->cuota, 'moneda' => $opcion->moneda] : null;
    }

    public function crear(array $datos): Servicio
    {
        return Servicio::create([...$this->normalizar($datos), ...$this->imagenes->resolver($datos, null, self::CARPETA)]);
    }

    public function actualizar(Servicio $servicio, array $datos): Servicio
    {
        $servicio->update([...$this->normalizar($datos), ...$this->imagenes->resolver($datos, $servicio->imagen, self::CARPETA)]);

        return $servicio->refresh();
    }

    public function eliminar(Servicio $servicio): void
    {
        $this->imagenes->eliminar($servicio->imagen);
        $servicio->delete();
    }

    /** Sin la imagen (se resuelve aparte); si se quitaron todas las características, el campo no llega → lista vacía. */
    private function normalizar(array $datos): array
    {
        return [
            ...collect($datos)->except(['imagen', 'quitar_imagen'])->all(),
            'caracteristicas' => array_values($datos['caracteristicas'] ?? []),
        ];
    }
}
