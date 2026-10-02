<?php

namespace App\Services;

use App\Models\OpcionPlan;
use App\Models\Servicio;
use App\Services\Erp\PlanesErp;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

/** Opciones del cotizador (montos referenciales), agrupadas por plan. Pueden venir del ERP. */
class OpcionPlanService
{
    public function __construct(private PlanesErp $planesErp) {}

    /** Planes con todas sus opciones (visibles u ocultas) para el panel. */
    public function planesConOpciones(): Collection
    {
        return Servicio::ordenado()
            ->with(['opciones' => fn ($q) => $q->ordenado()])
            ->get();
    }

    /** Catálogo de precios del ERP para elegir desde el panel. */
    public function catalogoErp(): array
    {
        $catalogo = $this->planesErp->catalogo();

        return [
            'configurado' => (bool) config('services.erp.url'),
            'planes' => $catalogo['items'],
            'actualizado' => $catalogo['actualizado'],
        ];
    }

    public function crear(array $datos): OpcionPlan
    {
        return OpcionPlan::create($datos);
    }

    /**
     * Agrega una opción con los precios del ERP: queda vinculada y se actualiza sola.
     *
     * @throws ValidationException si ese precio ya no está disponible en el ERP
     */
    public function importarDesdeErp(int $servicioId, string $erpRef): OpcionPlan
    {
        $precio = $this->planesErp->opcion($erpRef);

        if (! $precio || ! $precio['importable']) {
            throw ValidationException::withMessages([
                'erp_ref' => 'Ese precio ya no está disponible en el ERP. Actualiza la lista e inténtalo de nuevo.',
            ]);
        }

        return OpcionPlan::create([
            ...Arr::only($precio, ['nombre', 'nota', 'moneda', 'inicial', 'cuota', 'numero_cuotas', 'frecuencia']),
            'servicio_id' => $servicioId,
            'erp_ref' => $erpRef,
            'orden' => OpcionPlan::where('servicio_id', $servicioId)->count(),
        ]);
    }

    public function actualizar(OpcionPlan $opcion, array $datos): OpcionPlan
    {
        $opcion->update($datos);

        return $opcion->refresh();
    }

    public function eliminar(OpcionPlan $opcion): void
    {
        $opcion->delete();
    }
}
