import { Link, router } from '@inertiajs/react';
import { ArrowRight, BookOpenText, Briefcase, Building, CircleQuestionMark, Images, Inbox, LayoutTemplate, Palette, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import Panel from '@/components/admin/Panel';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatoFecha } from '@/lib/fechas';
import { cn } from '@/lib/utils';

const CATALOGOS_ERP = [
    { clave: 'talleres', etiqueta: 'Talleres aliados', href: '/talleres' },
    { clave: 'comercios', etiqueta: 'Comercios GO', href: '/beneficios' },
    { clave: 'cupones', etiqueta: 'Cupones públicos', href: '/beneficios' },
    { clave: 'planes', etiqueta: 'Precios de planes', href: '/admin/cotizador' },
];

/** Conexión con el ERP: qué se muestra en la web y cuándo se actualizó cada cosa. */
function PanelErp({ erp }) {
    const [actualizando, setActualizando] = useState(false);

    const actualizar = () =>
        router.post('/admin/erp/sincronizar', {}, { preserveScroll: true, onStart: () => setActualizando(true), onFinish: () => setActualizando(false) });

    return (
        <Panel title="Datos del ERP" className="mt-6">
            {erp.configurado ? (
                <div className="flex flex-col gap-4">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {CATALOGOS_ERP.map((c) => {
                            const estado = erp.catalogos[c.clave] ?? { cantidad: 0, actualizado: null };
                            return (
                                <a
                                    key={c.clave}
                                    href={c.href}
                                    className="flex items-center gap-3 rounded-xl p-3 ring-1 ring-gray-200 transition hover:bg-gray-50"
                                >
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-extrabold text-accent">
                                        {estado.cantidad}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-gray-900">{c.etiqueta}</span>
                                        <span className={cn('block truncate text-xs', estado.actualizado ? 'text-gray-500' : 'text-red-600')}>
                                            {estado.actualizado ? formatoFecha(estado.actualizado) : 'El ERP no respondió'}
                                        </span>
                                    </span>
                                </a>
                            );
                        })}
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-500">Se actualiza solo cada 30 minutos. Si el ERP no responde, la web sigue mostrando la última copia.</p>
                        <button
                            type="button"
                            onClick={actualizar}
                            disabled={actualizando}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
                        >
                            <RefreshCw className={cn('size-4', actualizando && 'animate-spin')} aria-hidden="true" />
                            {actualizando ? 'Actualizando...' : 'Actualizar ahora'}
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-gray-500">
                    Falta configurar <code className="rounded bg-gray-100 px-1.5 py-0.5">ERP_URL</code> en el archivo .env del servidor para mostrar talleres,
                    comercios, cupones y precios del ERP.
                </p>
            )}
        </Panel>
    );
}

export default function Dashboard({ resumen, ultimosMensajes, erp }) {
    const tarjetas = [
        { label: 'Solicitudes nuevas', valor: resumen.solicitudes_nuevas, icon: Inbox, href: '/admin/mensajes?estado=nuevo', alerta: resumen.solicitudes_nuevas > 0 },
        {
            label: 'Reclamaciones pendientes',
            valor: resumen.reclamaciones_pendientes,
            icon: BookOpenText,
            href: '/admin/reclamaciones?estado=pendiente',
            alerta: resumen.reclamaciones_pendientes > 0,
        },
        { label: 'Servicios visibles', valor: resumen.servicios_activos, icon: Briefcase, href: '/admin/servicios' },
        { label: 'Banners visibles', valor: resumen.banners_activos, icon: Images, href: '/admin/banners' },
        { label: 'Preguntas frecuentes', valor: resumen.preguntas_activas, icon: CircleQuestionMark, href: '/admin/preguntas' },
    ];

    const accesos = [
        { label: 'Empresa y contacto', descripcion: 'Teléfonos, WhatsApp, dirección y redes', href: '/admin/configuracion/empresa', icon: Building },
        { label: 'Apariencia', descripcion: 'Colores de marca, logo y favicon', href: '/admin/configuracion/apariencia', icon: Palette },
        { label: 'Secciones', descripcion: 'Textos e imágenes de cada página', href: '/admin/secciones', icon: LayoutTemplate },
    ];

    return (
        <AdminLayout title="Dashboard">
            <PageHeader title="Dashboard" description="Resumen del sitio web." />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5">
                {tarjetas.map((t) => (
                    <Link
                        key={t.label}
                        href={t.href}
                        className={cn(
                            'rounded-2xl p-4 shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md sm:p-5',
                            t.alerta ? 'bg-accent ring-accent-500 text-primary' : 'bg-white ring-gray-200',
                        )}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className={cn('text-xs font-semibold sm:text-sm', t.alerta ? 'text-primary' : 'text-gray-500')}>{t.label}</span>
                            <t.icon className={cn('size-5 shrink-0', t.alerta ? 'text-primary' : 'text-gray-400')} aria-hidden="true" />
                        </div>
                        <p className="mt-2 text-3xl font-extrabold">{t.valor}</p>
                    </Link>
                ))}
            </div>

            <PanelErp erp={erp} />

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Panel title="Últimas solicitudes" className="lg:col-span-2">
                    {ultimosMensajes.length === 0 ? (
                        <p className="py-6 text-center text-sm text-gray-500">Aún no llegan solicitudes del formulario de contacto ni del cotizador.</p>
                    ) : (
                        <ul className="-my-2 divide-y divide-gray-100">
                            {ultimosMensajes.map((m) => (
                                <li key={m.id} className="flex items-start gap-3 py-3">
                                    <span className={cn('mt-2 size-2 shrink-0 rounded-full', m.leido_at ? 'bg-transparent' : 'bg-primary')} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                                            <p className={cn('truncate text-sm', m.leido_at ? 'text-gray-700' : 'font-bold text-gray-900')}>{m.nombre}</p>
                                            <span className="text-xs text-gray-400">{formatoFecha(m.created_at)}</span>
                                        </div>
                                        <p className="truncate text-sm text-gray-500">{m.asunto ? `${m.asunto} · ` : ''}{m.mensaje}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <Link href="/admin/mensajes" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                        Ver todas las solicitudes <ArrowRight className="size-4" />
                    </Link>
                </Panel>

                <Panel title="Accesos rápidos">
                    <ul className="flex flex-col gap-2">
                        {accesos.map((a) => (
                            <li key={a.href}>
                                <Link href={a.href} className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-gray-50">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-accent">
                                        <a.icon className="size-5" aria-hidden="true" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-gray-900">{a.label}</span>
                                        <span className="block truncate text-xs text-gray-500">{a.descripcion}</span>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Panel>
            </div>
        </AdminLayout>
    );
}
