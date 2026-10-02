import { Calculator, ExternalLink, Link2, Plus, RefreshCw, Save, Search, Unlink } from 'lucide-react';
import { useMemo, useState } from 'react';
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
import { useAccionApi } from '@/hooks/useAccionApi';
import { useCrudModal } from '@/hooks/useCrudModal';
import { formatoFecha } from '@/lib/fechas';
import { FRECUENCIAS, resumenOpcion } from '@/lib/moneda';

const VACIO = {
    servicio_id: '',
    erp_ref: '',
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

/** Fila de un precio del ERP con el selector de plan para agregarlo al cotizador. */
function PrecioErp({ opcion, planes, vinculadaEn }) {
    const [planId, setPlanId] = useState(planes[0]?.id ?? '');
    const { ejecutar, enCurso: enviando } = useAccionApi();

    const agregar = () => ejecutar('post', '/admin/cotizador/opciones/erp', { servicio_id: planId, erp_ref: opcion.ref });

    return (
        <li className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{opcion.nombre}</p>
                <p className="text-sm text-gray-600">{montos(opcion)}</p>
                {opcion.nota && <p className="text-xs text-gray-400">{opcion.nota}</p>}
                {vinculadaEn.length > 0 && (
                    <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                        <Link2 className="size-3" aria-hidden="true" /> En el cotizador: {vinculadaEn.join(', ')}
                    </p>
                )}
            </div>
            {opcion.importable ? (
                <div className="flex shrink-0 items-center gap-2">
                    <Select
                        aria-label={'Plan para ' + opcion.nombre}
                        value={planId}
                        onChange={(e) => setPlanId(e.target.value)}
                        options={planes.map((p) => ({ value: p.id, label: p.titulo }))}
                        className="h-9 w-48 text-sm sm:h-9"
                    />
                    <Button variant="secondary" size="sm" icon={Plus} onClick={agregar} disabled={enviando || !planId}>
                        Agregar
                    </Button>
                </div>
            ) : (
                <p className="shrink-0 text-xs text-gray-400">Frecuencia no compatible con el cotizador</p>
            )}
        </li>
    );
}

/** Precios de los planes del ERP: al agregarlos quedan vinculados y se actualizan solos. */
function PreciosErp({ erp, planes }) {
    const [buscar, setBuscar] = useState('');
    const { ejecutar, enCurso: actualizando } = useAccionApi();

    // En qué planes del cotizador está vinculada cada referencia del ERP
    const vinculos = useMemo(() => {
        const mapa = {};
        planes.forEach((plan) =>
            plan.opciones.forEach((o) => {
                if (o.erp_ref) (mapa[o.erp_ref] ??= []).push(plan.titulo);
            }),
        );
        return mapa;
    }, [planes]);

    const texto = buscar.trim().toLowerCase();
    const visibles = erp.planes
        .map((plan) => ({
            ...plan,
            opciones: plan.opciones.filter((o) => !texto || [plan.nombre, plan.categoria, o.nombre].join(' ').toLowerCase().includes(texto)),
        }))
        .filter((plan) => plan.opciones.length > 0);

    const actualizar = () => ejecutar('post', '/admin/erp/sincronizar');

    return (
        <section className="mt-8 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-5">
            <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="flex items-center gap-2 font-bold text-gray-900">
                        <Link2 className="size-5 text-primary" aria-hidden="true" /> Precios del ERP
                    </h2>
                    <p className="text-sm text-gray-500">
                        Agrega una opción con los precios del ERP: queda vinculada y sus montos se actualizan solos cada 30 minutos.
                        {erp.actualizado && ' Última lectura: ' + formatoFecha(erp.actualizado) + '.'}
                    </p>
                </div>
                {erp.configurado && (
                    <Button variant="ghost" size="sm" icon={RefreshCw} onClick={actualizar} disabled={actualizando} className="shrink-0 border border-gray-200">
                        {actualizando ? 'Actualizando...' : 'Actualizar'}
                    </Button>
                )}
            </header>

            {!erp.configurado ? (
                <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
                    Falta configurar <code className="rounded bg-white px-1.5 py-0.5">ERP_URL</code> en el .env del servidor.
                </p>
            ) : erp.planes.length === 0 ? (
                <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">El ERP no respondió o no tiene planes con precio. Intenta actualizar en unos minutos.</p>
            ) : (
                <>
                    <div className="relative mb-2 max-w-sm">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                        <Input
                            type="search"
                            aria-label="Buscar en los precios del ERP"
                            placeholder="Buscar plan o variante"
                            value={buscar}
                            onChange={(e) => setBuscar(e.target.value)}
                            className="h-10 pl-9 sm:h-10"
                        />
                    </div>
                    {visibles.map((plan) => (
                        <div key={plan.id} className="mt-4">
                            <p className="text-xs font-bold tracking-wide text-gray-400 uppercase">
                                {plan.categoria ? plan.categoria + ' · ' : ''}
                                {plan.nombre}
                            </p>
                            <ul className="divide-y divide-gray-100">
                                {plan.opciones.map((opcion) => (
                                    <PrecioErp key={opcion.ref} opcion={opcion} planes={planes} vinculadaEn={vinculos[opcion.ref] ?? []} />
                                ))}
                            </ul>
                        </div>
                    ))}
                </>
            )}
        </section>
    );
}

export default function CotizadorIndex({ planes, monedas, frecuencias, erp }) {
    const crud = useCrudModal({
        url: '/admin/cotizador/opciones',
        vacio: VACIO,
        aFormulario: (o) => ({
            ...VACIO,
            ...o,
            erp_ref: o.erp_ref ?? '',
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
                                                    {opcion.erp_ref && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary">
                                                            <Link2 className="size-3" aria-hidden="true" /> Precio del ERP
                                                        </span>
                                                    )}
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

            {planes.length > 0 && <PreciosErp erp={erp} planes={planes} />}

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
                    {data.erp_ref && (
                        <div className="flex flex-col gap-3 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="flex items-start gap-2">
                                <Link2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                                Vinculada al ERP: los montos se actualizan solos cada 30 minutos. El nombre y la nota puedes cambiarlos.
                            </p>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                icon={Unlink}
                                onClick={() => setData('erp_ref', '')}
                                className="shrink-0 border border-primary-200 bg-white"
                            >
                                Quitar vínculo
                            </Button>
                        </div>
                    )}
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
