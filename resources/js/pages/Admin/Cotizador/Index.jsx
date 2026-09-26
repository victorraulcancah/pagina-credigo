import { Calculator, ExternalLink, Plus, Save } from 'lucide-react';
import AccionesFila from '@/components/admin/AccionesFila';
import EmptyState from '@/components/admin/EmptyState';
import EstadoBadge from '@/components/admin/EstadoBadge';
import PageHeader from '@/components/admin/PageHeader';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Icono from '@/components/ui/Icono';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Switch from '@/components/ui/Switch';
import { useCrudModal } from '@/hooks/useCrudModal';
import { FRECUENCIAS, resumenOpcion } from '@/lib/moneda';

const VACIO = {
    servicio_id: '',
    nombre: '',
    nota: '',
    moneda: 'PEN',
    inicial: '',
    cuota: '',
    numero_cuotas: '',
    frecuencia: 'semanal',
    orden: 0,
    activo: true,
};

const ETIQUETA_MONEDA = { PEN: 'Soles (S/)', USD: 'Dólares (US$)' };

/** Texto corto con los montos de una opción, para la lista. */
function montos(opcion) {
    const r = resumenOpcion(opcion);
    const partes = [
        r.inicial && `Inicial ${r.inicial}`,
        r.cuota && `${r.numeroCuotas ? `${r.numeroCuotas} × ` : ''}${r.cuota} ${r.frecuencia.plural}`,
        r.total && `Total ${r.total}`,
    ].filter(Boolean);

    return partes.length ? partes.join(' · ') : 'Sin montos: se muestra "consulta la cuota"';
}

export default function CotizadorIndex({ planes, monedas, frecuencias }) {
    const crud = useCrudModal({
        url: '/admin/cotizador/opciones',
        vacio: VACIO,
        aFormulario: (o) => ({
            ...VACIO,
            ...o,
            nota: o.nota ?? '',
            inicial: o.inicial ?? '',
            cuota: o.cuota ?? '',
            numero_cuotas: o.numero_cuotas ?? '',
        }),
    });
    const { data, setData, errors, processing } = crud.form;

    const nuevaOpcion = (plan) => crud.abrirNuevo({ servicio_id: plan?.id ?? planes[0]?.id ?? '', orden: plan?.opciones.length ?? 0 });

    return (
        <AdminLayout title="Cotizador">
            <PageHeader
                title="Cotizador"
                description="Opciones con montos referenciales por plan. En la web solo aparecen los planes visibles que tengan opciones visibles."
                actions={
                    <>
                        <Button href="/cotizador" newTab variant="ghost" icon={ExternalLink} className="border border-gray-200">
                            Ver cotizador
                        </Button>
                        {planes.length > 0 && (
                            <Button variant="secondary" icon={Plus} onClick={() => nuevaOpcion()}>
                                Nueva opción
                            </Button>
                        )}
                    </>
                }
            />

            {planes.length === 0 ? (
                <EmptyState icon={Calculator} title="Primero crea tus planes" description="Las opciones del cotizador se agregan a cada plan de la sección Servicios." />
            ) : (
                <div className="flex flex-col gap-6">
                    {planes.map((plan) => (
                        <section key={plan.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-5">
                            <header className="mb-4 flex flex-wrap items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
                                    <Icono nombre={plan.icono} className="size-5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    {plan.etiqueta && <p className="text-xs font-bold tracking-wide text-gray-400 uppercase">{plan.etiqueta}</p>}
                                    <h2 className="font-bold text-gray-900">
                                        {plan.titulo}
                                        {!plan.activo && <span className="ml-2 text-xs font-medium text-gray-400">(plan oculto)</span>}
                                    </h2>
                                </div>
                                <Button variant="ghost" size="sm" icon={Plus} onClick={() => nuevaOpcion(plan)} className="border border-gray-200">
                                    Agregar opción
                                </Button>
                            </header>

                            {plan.opciones.length === 0 ? (
                                <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">Sin opciones: este plan no aparece en el cotizador.</p>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {plan.opciones.map((opcion) => (
                                        <li key={opcion.id} className="flex items-start gap-3 py-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-semibold text-gray-900">{opcion.nombre}</p>
                                                    <EstadoBadge activo={opcion.activo} />
                                                </div>
                                                <p className="text-sm text-gray-600">{montos(opcion)}</p>
                                                {opcion.nota && <p className="text-xs text-gray-400">{opcion.nota}</p>}
                                            </div>
                                            <AccionesFila onEditar={() => crud.abrirEditar(opcion)} onEliminar={() => crud.eliminar(opcion, `la opción "${opcion.nombre}"`)} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    ))}
                </div>
            )}

            <Modal
                open={crud.abierto}
                onClose={crud.cerrar}
                title={crud.editando ? 'Editar opción' : 'Nueva opción'}
                footer={
                    <>
                        <Button variant="ghost" onClick={crud.cerrar}>
                            Cancelar
                        </Button>
                        <Button type="submit" form="form-opcion" variant="secondary" icon={Save} disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </>
                }
            >
                <form id="form-opcion" onSubmit={crud.guardar} className="grid gap-5 sm:grid-cols-2">
                    <FormField label="Plan" htmlFor="servicio_id" error={errors.servicio_id} required className="sm:col-span-2">
                        <Select
                            id="servicio_id"
                            value={data.servicio_id}
                            onChange={(e) => setData('servicio_id', e.target.value)}
                            error={errors.servicio_id}
                            options={planes.map((p) => ({ value: p.id, label: p.titulo }))}
                        />
                    </FormField>
                    <FormField label="Nombre de la opción" htmlFor="nombre" error={errors.nombre} required className="sm:col-span-2">
                        <Input id="nombre" value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} error={errors.nombre} placeholder="Ej. Auto · certificado 15k USD" />
                    </FormField>
                    <FormField label="Nota" htmlFor="nota" error={errors.nota} hint="Texto pequeño debajo del nombre (opcional)." className="sm:col-span-2">
                        <Input id="nota" value={data.nota} onChange={(e) => setData('nota', e.target.value)} error={errors.nota} />
                    </FormField>
                    <FormField label="Moneda de los montos" htmlFor="moneda" error={errors.moneda}>
                        <Select id="moneda" value={data.moneda} onChange={(e) => setData('moneda', e.target.value)} options={monedas.map((m) => ({ value: m, label: ETIQUETA_MONEDA[m] ?? m }))} />
                    </FormField>
                    <FormField label="Frecuencia de pago" htmlFor="frecuencia" error={errors.frecuencia}>
                        <Select
                            id="frecuencia"
                            value={data.frecuencia}
                            onChange={(e) => setData('frecuencia', e.target.value)}
                            options={frecuencias.map((f) => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }))}
                        />
                    </FormField>
                    <FormField label="Inicial o inscripción" htmlFor="inicial" error={errors.inicial} hint="Vacío si no aplica.">
                        <Input id="inicial" type="number" min={0} step="0.01" inputMode="decimal" value={data.inicial} onChange={(e) => setData('inicial', e.target.value)} error={errors.inicial} />
                    </FormField>
                    <FormField label={`Monto de cada cuota (${FRECUENCIAS[data.frecuencia]?.periodo ?? ''})`} htmlFor="cuota" error={errors.cuota} hint='Vacío = "consulta la cuota con un asesor".'>
                        <Input id="cuota" type="number" min={0} step="0.01" inputMode="decimal" value={data.cuota} onChange={(e) => setData('cuota', e.target.value)} error={errors.cuota} />
                    </FormField>
                    <FormField label="Número de cuotas" htmlFor="numero_cuotas" error={errors.numero_cuotas}>
                        <Input id="numero_cuotas" type="number" min={1} step="1" inputMode="numeric" value={data.numero_cuotas} onChange={(e) => setData('numero_cuotas', e.target.value)} error={errors.numero_cuotas} />
                    </FormField>
                    <FormField label="Orden" htmlFor="orden" error={errors.orden}>
                        <Input id="orden" type="number" min={0} value={data.orden} onChange={(e) => setData('orden', e.target.value)} error={errors.orden} />
                    </FormField>

                    <div className="rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary sm:col-span-2">
                        <p className="font-semibold">Así se verá en el cotizador</p>
                        <p className="mt-0.5">{montos(data)}</p>
                    </div>

                    <div className="rounded-xl bg-gray-50 px-4 py-3 sm:col-span-2">
                        <Switch label="Visible en el cotizador" checked={data.activo} onChange={(valor) => setData('activo', valor)} />
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
