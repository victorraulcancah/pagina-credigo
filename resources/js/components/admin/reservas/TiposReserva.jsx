import { Check, Copy, MapPinned, Plus, Save, Tags } from 'lucide-react';
import { useState } from 'react';
import AccionesFila from '@/components/admin/AccionesFila';
import Cargando from '@/components/admin/Cargando';
import EmptyState from '@/components/admin/EmptyState';
import EstadoBadge from '@/components/admin/EstadoBadge';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Switch from '@/components/ui/Switch';
import { useConsulta } from '@/hooks/useConsulta';
import { useCrudModal } from '@/hooks/useCrudModal';

const VACIO = { nombre: '', descripcion: '', pide_ruta: true, orden: 0, activo: true };

/** Copia la dirección de reserva de un tipo (para usarla en publicaciones o mensajes). */
function CopiarEnlace({ slug }) {
    const [copiado, setCopiado] = useState(false);
    const url = `${window.location.origin}/reservar?tipo=${slug}`;

    const copiar = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 1800);
        } catch {
            window.prompt('Copia la dirección:', url);
        }
    };

    return (
        <button type="button" onClick={copiar} className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-primary" title="Copiar la dirección">
            {copiado ? <Check className="size-3.5 text-emerald-600" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
            /reservar?tipo={slug}
        </button>
    );
}

/**
 * Lo que se puede reservar en la web (ej. Viaje, Traslado al aeropuerto). Cada tipo tiene su
 * dirección (/reservar?tipo=…) para los botones del banner. Pide origen y destino si es un traslado.
 */
export default function TiposReserva({ alCambiar }) {
    const lista = useConsulta('/admin/reservas/tipos');
    const tipos = lista.datos ?? [];
    const recargar = () => {
        lista.recargar();
        alCambiar?.();
    };
    const crud = useCrudModal({
        url: '/admin/reservas/tipos',
        recargar,
        vacio: VACIO,
        aFormulario: (t) => ({ ...VACIO, ...t, descripcion: t.descripcion ?? '' }),
    });
    const { data, setData, errors, processing } = crud.form;

    const nuevo = (
        <Button variant="secondary" icon={Plus} onClick={() => crud.abrirNuevo({ orden: tipos.length })}>
            Nuevo tipo
        </Button>
    );

    return (
        <>
            <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                    Lo que el cliente puede reservar en la web. En los botones del banner eliges a cuál lleva (<b>A dónde lleva → Reservar</b>).
                </p>
                {nuevo}
            </div>

            {!lista.datos ? (
                <Cargando error={lista.error} onReintentar={lista.recargar} />
            ) : tipos.length === 0 ? (
                <EmptyState icon={Tags} title="Todavía no hay nada para reservar" description="Crea un tipo (ej. Viaje) para que el formulario de reserva aparezca en la web." action={nuevo} />
            ) : (
                <ul className="flex flex-col gap-3">
                    {tipos.map((tipo) => (
                        <li key={tipo.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:flex-row sm:items-center">
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <EstadoBadge activo={tipo.activo} />
                                    {tipo.pide_ruta && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                            <MapPinned className="size-3" aria-hidden="true" /> Pide origen y destino
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-400">
                                        {tipo.reservas_count} {tipo.reservas_count === 1 ? 'reserva' : 'reservas'} · Orden {tipo.orden}
                                    </span>
                                </div>
                                <h3 className="mt-1 font-bold text-gray-900">{tipo.nombre}</h3>
                                {tipo.descripcion && <p className="text-sm text-gray-500">{tipo.descripcion}</p>}
                                <CopiarEnlace slug={tipo.slug} />
                            </div>
                            <AccionesFila
                                onEditar={() => crud.abrirEditar(tipo)}
                                onEliminar={() => crud.eliminar(tipo, `"${tipo.nombre}" (sus reservas se quedan en la lista)`)}
                            />
                        </li>
                    ))}
                </ul>
            )}

            <Modal
                open={crud.abierto}
                onClose={crud.cerrar}
                title={crud.editando ? 'Editar tipo de reserva' : 'Nuevo tipo de reserva'}
                maxWidth="max-w-lg"
                footer={
                    <>
                        <Button variant="ghost" onClick={crud.cerrar}>
                            Cancelar
                        </Button>
                        <Button type="submit" form="form-tipo-reserva" variant="secondary" icon={Save} disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </>
                }
            >
                <form id="form-tipo-reserva" onSubmit={crud.guardar} className="grid gap-5">
                    <FormField label="Nombre" htmlFor="nombre" error={errors.nombre} required hint="Como lo ve el cliente. Ej. Viaje, Traslado al aeropuerto.">
                        <Input id="nombre" value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} error={errors.nombre} maxLength={60} />
                    </FormField>
                    <FormField label="Descripción" htmlFor="descripcion" error={errors.descripcion} hint="Opcional. Una línea bajo el nombre.">
                        <Input id="descripcion" value={data.descripcion} onChange={(e) => setData('descripcion', e.target.value)} error={errors.descripcion} maxLength={160} />
                    </FormField>
                    <div className="rounded-xl bg-gray-50 px-4 py-3">
                        <Switch
                            label="Pide origen, destino y pasajeros"
                            description="Para viajes y traslados. Apágalo para reservas sin recorrido."
                            checked={data.pide_ruta}
                            onChange={(valor) => setData('pide_ruta', valor)}
                        />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField label="Orden" htmlFor="orden" error={errors.orden} hint="Menor número = aparece primero.">
                            <Input id="orden" type="number" min={0} value={data.orden} onChange={(e) => setData('orden', e.target.value)} error={errors.orden} />
                        </FormField>
                        <div className="flex items-center rounded-xl bg-gray-50 px-4 py-3">
                            <Switch className="w-full" label="Visible en la web" checked={data.activo} onChange={(valor) => setData('activo', valor)} />
                        </div>
                    </div>
                </form>
            </Modal>
        </>
    );
}
