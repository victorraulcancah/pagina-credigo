import { Clock, ExternalLink, MapPin, Phone, Plus, Save } from 'lucide-react';
import AccionesFila from '@/components/admin/AccionesFila';
import Cargando from '@/components/admin/Cargando';
import EmptyState from '@/components/admin/EmptyState';
import EstadoBadge from '@/components/admin/EstadoBadge';
import PageHeader from '@/components/admin/PageHeader';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Switch from '@/components/ui/Switch';
import { refrescarCompartido } from '@/hooks/useCompartido';
import { useConsulta } from '@/hooks/useConsulta';
import { useCrudModal } from '@/hooks/useCrudModal';

const VACIO = { ciudad: '', nombre: '', direccion: '', telefono: '', horario: '', mapa_url: '', orden: 0, activo: true };

/** Oficinas de la empresa: salen como "Nuestras oficinas" en el pie de la web y en la página Soporte. */
export default function SedesIndex() {
    const lista = useConsulta('/admin/sedes');
    const sedes = lista.datos ?? [];
    const recargar = () => {
        lista.recargar();
        refrescarCompartido('/sedes'); // el pie del panel y de la web comparten esta lista
    };
    const crud = useCrudModal({
        url: '/admin/sedes',
        vacio: VACIO,
        aFormulario: (s) => ({ ...VACIO, ...s, nombre: s.nombre ?? '', telefono: s.telefono ?? '', horario: s.horario ?? '', mapa_url: s.mapa_url ?? '' }),
        recargar,
    });
    const { data, setData, errors, processing } = crud.form;

    const nueva = (
        <Button variant="secondary" icon={Plus} onClick={() => crud.abrirNuevo({ orden: sedes.length })}>
            Nueva sede
        </Button>
    );

    return (
        <AdminLayout title="Sedes">
            <PageHeader
                title="Sedes"
                description='Las oficinas de la empresa (Arequipa, Lima…). Salen como "Nuestras oficinas" en el pie de la web y en Soporte. La dirección de Empresa y contacto se mantiene para el Libro de Reclamaciones.'
                actions={nueva}
            />

            {!lista.datos ? (
                <Cargando error={lista.error} onReintentar={lista.recargar} />
            ) : sedes.length === 0 ? (
                <EmptyState icon={MapPin} title="Aún no hay sedes" description="Agrega la primera oficina. Mientras no haya ninguna, el pie muestra la dirección de Empresa y contacto." action={nueva} />
            ) : (
                <ul className="flex flex-col gap-3">
                    {sedes.map((sede) => (
                        <li key={sede.id} className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                                <MapPin className="size-5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-bold text-gray-900">{sede.ciudad}</h3>
                                    {sede.nombre && <span className="text-sm text-gray-500">· {sede.nombre}</span>}
                                    <EstadoBadge activo={sede.activo} />
                                    <span className="text-xs text-gray-400">Orden {sede.orden}</span>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">{sede.direccion}</p>
                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                    {sede.telefono && (
                                        <span className="inline-flex items-center gap-1">
                                            <Phone className="size-3.5" aria-hidden="true" /> {sede.telefono}
                                        </span>
                                    )}
                                    {sede.horario && (
                                        <span className="inline-flex items-center gap-1">
                                            <Clock className="size-3.5" aria-hidden="true" /> {sede.horario}
                                        </span>
                                    )}
                                    {sede.mapa_url && (
                                        <a href={sede.mapa_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                                            <ExternalLink className="size-3.5" aria-hidden="true" /> Ver mapa
                                        </a>
                                    )}
                                </div>
                            </div>
                            <AccionesFila onEditar={() => crud.abrirEditar(sede)} onEliminar={() => crud.eliminar(sede, `la sede de ${sede.ciudad}`)} />
                        </li>
                    ))}
                </ul>
            )}

            <Modal
                open={crud.abierto}
                onClose={crud.cerrar}
                title={crud.editando ? 'Editar sede' : 'Nueva sede'}
                footer={
                    <>
                        <Button variant="ghost" onClick={crud.cerrar}>
                            Cancelar
                        </Button>
                        <Button type="submit" form="form-sede" variant="secondary" icon={Save} disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </>
                }
            >
                <form id="form-sede" onSubmit={crud.guardar} className="grid gap-5 sm:grid-cols-2">
                    <FormField label="Ciudad" htmlFor="ciudad" error={errors.ciudad} required hint="Ej. Lima o Arequipa. Es el título de la sede en la web.">
                        <Input id="ciudad" value={data.ciudad} onChange={(e) => setData('ciudad', e.target.value)} error={errors.ciudad} placeholder="Lima" />
                    </FormField>
                    <FormField label="Nombre de la sede" htmlFor="nombre" error={errors.nombre} hint="Opcional. Ej. Oficina principal.">
                        <Input id="nombre" value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} error={errors.nombre} />
                    </FormField>
                    <FormField label="Dirección" htmlFor="direccion" error={errors.direccion} required className="sm:col-span-2">
                        <Input id="direccion" value={data.direccion} onChange={(e) => setData('direccion', e.target.value)} error={errors.direccion} placeholder="Av. Ejemplo 123, Miraflores" />
                    </FormField>
                    <FormField label="Teléfono" htmlFor="telefono" error={errors.telefono} hint="Opcional.">
                        <Input id="telefono" type="tel" value={data.telefono} onChange={(e) => setData('telefono', e.target.value)} error={errors.telefono} />
                    </FormField>
                    <FormField label="Horario de atención" htmlFor="horario" error={errors.horario} hint="Opcional. Ej. Lun a Sáb de 9 a. m. a 6 p. m.">
                        <Input id="horario" value={data.horario} onChange={(e) => setData('horario', e.target.value)} error={errors.horario} />
                    </FormField>
                    <FormField
                        label="Enlace del mapa"
                        htmlFor="mapa_url"
                        error={errors.mapa_url}
                        hint='Opcional. En Google Maps: busca la dirección → Compartir → copia el enlace. En la web sale como "Ver mapa".'
                        className="sm:col-span-2"
                    >
                        <Input id="mapa_url" type="url" value={data.mapa_url} onChange={(e) => setData('mapa_url', e.target.value)} error={errors.mapa_url} placeholder="https://maps.app.goo.gl/..." />
                    </FormField>
                    <FormField label="Orden" htmlFor="orden" error={errors.orden} hint="Las sedes se muestran de menor a mayor.">
                        <Input id="orden" type="number" min={0} value={data.orden} onChange={(e) => setData('orden', e.target.value)} error={errors.orden} />
                    </FormField>
                    <div className="flex items-center rounded-xl bg-gray-50 px-4 py-3">
                        <Switch className="w-full" label="Visible en el sitio" checked={data.activo} onChange={(valor) => setData('activo', valor)} />
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
