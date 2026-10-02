import { ExternalLink, FileText, Plus, Save } from 'lucide-react';
import AccionesFila from '@/components/admin/AccionesFila';
import Cargando from '@/components/admin/Cargando';
import EmptyState from '@/components/admin/EmptyState';
import EstadoBadge from '@/components/admin/EstadoBadge';
import PageHeader from '@/components/admin/PageHeader';
import AdminLayout from '@/components/layout/AdminLayout';
import ArchivoInput from '@/components/ui/ArchivoInput';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Switch from '@/components/ui/Switch';
import Textarea from '@/components/ui/Textarea';
import { useConsulta } from '@/hooks/useConsulta';
import { useCrudModal } from '@/hooks/useCrudModal';
import { formatoTamano } from '@/lib/archivos';

const VACIO = { titulo: '', descripcion: '', categoria: 'requisitos', servicio_id: '', archivo: null, orden: 0, activo: true };

/** PDFs que se descargan en la web. La categoría decide la página donde aparecen. */
export default function DocumentosIndex() {
    const lista = useConsulta('/admin/documentos');
    const documentos = lista.datos ?? [];
    // Opciones del formulario: dónde se muestra cada categoría, planes y peso máximo
    const { categorias = [], planes = [], max_mb: maxMb = 10 } = lista.respuesta?.opciones ?? {};
    const crud = useCrudModal({
        url: '/admin/documentos',
        recargar: lista.recargar,
        vacio: VACIO,
        aFormulario: (d) => ({ ...VACIO, ...d, descripcion: d.descripcion ?? '', servicio_id: d.servicio_id ?? '', archivo: null }),
    });
    const { form } = crud;
    const { data, setData, errors, processing } = form;

    const nuevo = (
        <Button variant="secondary" icon={Plus} onClick={() => crud.abrirNuevo({ orden: documentos.length })}>
            Subir documento
        </Button>
    );

    const grupos = categorias.map((categoria) => ({ ...categoria, documentos: documentos.filter((d) => d.categoria === categoria.valor) })).filter((g) => g.documentos.length);

    return (
        <AdminLayout title="Documentos">
            <PageHeader
                title="Documentos"
                description="PDFs para descargar en la web: requisitos, fichas de planes, guías de pago y documentos legales. Todo lo que subas aquí es público: nunca subas contratos ni documentos con datos personales."
                actions={nuevo}
            />

            {!lista.datos ? (
                <Cargando error={lista.error} onReintentar={lista.recargar} />
            ) : documentos.length === 0 ? (
                <EmptyState icon={FileText} title="No hay documentos" description="Sube un PDF y elige en qué página se muestra." action={nuevo} />
            ) : (
                <div className="flex flex-col gap-8">
                    {grupos.map((grupo) => (
                        <section key={grupo.valor}>
                            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-500">
                                {grupo.nombre}
                                <a href={grupo.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-gray-400 hover:text-primary">
                                    {grupo.url} <ExternalLink className="size-3.5" aria-hidden="true" />
                                </a>
                            </h2>
                            <ul className="flex flex-col gap-3">
                                {grupo.documentos.map((documento) => (
                                    <li key={documento.id} className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
                                        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-accent">
                                            <FileText className="size-6" aria-hidden="true" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <EstadoBadge activo={documento.activo} />
                                                {documento.servicio && (
                                                    <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary">{documento.servicio.titulo}</span>
                                                )}
                                                <span className="text-xs text-gray-400">Orden {documento.orden}</span>
                                            </div>
                                            <h3 className="mt-1 font-bold text-gray-900">{documento.titulo}</h3>
                                            {documento.descripcion && <p className="line-clamp-2 text-sm text-gray-500">{documento.descripcion}</p>}
                                            <a
                                                href={documento.archivo_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                            >
                                                Ver PDF · {formatoTamano(documento.tamano)} <ExternalLink className="size-3" aria-hidden="true" />
                                            </a>
                                        </div>
                                        <AccionesFila onEditar={() => crud.abrirEditar(documento)} onEliminar={() => crud.eliminar(documento, `"${documento.titulo}"`)} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            )}

            <Modal
                open={crud.abierto}
                onClose={crud.cerrar}
                title={crud.editando ? 'Editar documento' : 'Subir documento'}
                footer={
                    <>
                        <Button variant="ghost" onClick={crud.cerrar}>Cancelar</Button>
                        <Button type="submit" form="form-documento" variant="secondary" icon={Save} disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </>
                }
            >
                <form id="form-documento" onSubmit={crud.guardar} className="grid gap-5 sm:grid-cols-2">
                    <FormField label="Título" htmlFor="titulo" error={errors.titulo} required hint='Lo que verá el cliente. Ej. "Lista de requisitos para inscribirte"' className="sm:col-span-2">
                        <Input id="titulo" value={data.titulo} onChange={(e) => setData('titulo', e.target.value)} error={errors.titulo} />
                    </FormField>
                    <FormField label="Descripción" htmlFor="descripcion" error={errors.descripcion} hint="Opcional. Para qué sirve o cuándo usarlo." className="sm:col-span-2">
                        <Textarea id="descripcion" rows={2} value={data.descripcion} onChange={(e) => setData('descripcion', e.target.value)} error={errors.descripcion} />
                    </FormField>
                    <FormField label="Dónde se muestra" htmlFor="categoria" error={errors.categoria} required>
                        <Select
                            id="categoria"
                            value={data.categoria}
                            onChange={(e) => setData('categoria', e.target.value)}
                            options={categorias.map((c) => ({ value: c.valor, label: `${c.nombre} (${c.url})` }))}
                            error={errors.categoria}
                        />
                    </FormField>
                    {data.categoria === 'planes' ? (
                        <FormField label="Plan" htmlFor="servicio_id" error={errors.servicio_id} hint="Con un plan, aparece en su tarjeta. Sin plan, debajo de todos los planes.">
                            <Select
                                id="servicio_id"
                                value={data.servicio_id}
                                onChange={(e) => setData('servicio_id', e.target.value)}
                                placeholder="Todos los planes (general)"
                                options={planes.map((p) => ({ value: p.id, label: p.titulo }))}
                                error={errors.servicio_id}
                            />
                        </FormField>
                    ) : (
                        <span className="hidden sm:block" />
                    )}
                    <div className="sm:col-span-2">
                        <ArchivoInput
                            id="archivo"
                            icon={FileText}
                            titulo={crud.editando ? 'Reemplazar el PDF (opcional)' : 'Elige el PDF'}
                            formatos={`Solo PDF, máx. ${maxMb} MB. Mientras menos pese, más rápido se descarga en el celular.`}
                            accept="application/pdf,.pdf"
                            maxMb={maxMb}
                            value={data.archivo}
                            onChange={(archivo) => setData('archivo', archivo)}
                            error={errors.archivo}
                        />
                        {crud.editando && !data.archivo && (
                            <p className="mt-2 text-sm text-gray-500">
                                Archivo actual:{' '}
                                <a href={crud.editando.archivo_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                                    ver PDF ({formatoTamano(crud.editando.tamano)})
                                </a>
                            </p>
                        )}
                    </div>
                    <FormField label="Orden" htmlFor="orden" error={errors.orden} hint="Menor número = aparece primero.">
                        <Input id="orden" type="number" min={0} value={data.orden} onChange={(e) => setData('orden', e.target.value)} error={errors.orden} />
                    </FormField>
                    <div className="flex items-center rounded-xl bg-gray-50 px-4 py-3">
                        <Switch label="Visible en el sitio" checked={data.activo} onChange={(valor) => setData('activo', valor)} />
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
