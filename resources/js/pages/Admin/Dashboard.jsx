import { Link } from '@inertiajs/react';
import { ArrowRight, Briefcase, Building, CircleQuestionMark, Images, Inbox, LayoutTemplate, Palette } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import Panel from '@/components/admin/Panel';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatoFecha } from '@/lib/fechas';
import { cn } from '@/lib/utils';

export default function Dashboard({ resumen, ultimosMensajes }) {
    const tarjetas = [
        { label: 'Mensajes sin leer', valor: resumen.mensajes_no_leidos, icon: Inbox, href: '/admin/mensajes?estado=no_leidos', alerta: resumen.mensajes_no_leidos > 0 },
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

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Panel title="Últimos mensajes" className="lg:col-span-2">
                    {ultimosMensajes.length === 0 ? (
                        <p className="py-6 text-center text-sm text-gray-500">Aún no llegan mensajes del formulario de contacto.</p>
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
                        Ver todos los mensajes <ArrowRight className="size-4" />
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
