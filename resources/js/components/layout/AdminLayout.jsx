import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpenText,
    Briefcase,
    Building,
    CircleQuestionMark,
    ExternalLink,
    Images,
    Inbox,
    LayoutDashboard,
    LayoutTemplate,
    LogOut,
    Menu,
    Palette,
    UserCog,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSitio, useTemaColores } from '@/hooks/useSitio';
import { cn } from '@/lib/utils';

const menu = [
    { items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exacto: true }] },
    {
        grupo: 'Sitio web',
        items: [
            { label: 'Banners', href: '/admin/banners', icon: Images },
            { label: 'Secciones', href: '/admin/secciones', icon: LayoutTemplate },
            { label: 'Servicios', href: '/admin/servicios', icon: Briefcase },
            { label: 'Preguntas frecuentes', href: '/admin/preguntas', icon: CircleQuestionMark },
        ],
    },
    {
        grupo: 'Contacto',
        items: [
            { label: 'Mensajes', href: '/admin/mensajes', icon: Inbox, contador: 'mensajesNoLeidos' },
            { label: 'Libro de Reclamaciones', href: '/admin/reclamaciones', icon: BookOpenText, contador: 'reclamacionesPendientes' },
        ],
    },
    {
        grupo: 'Configuración',
        items: [
            { label: 'Empresa y contacto', href: '/admin/configuracion/empresa', icon: Building },
            { label: 'Apariencia', href: '/admin/configuracion/apariencia', icon: Palette },
            { label: 'Mi perfil', href: '/admin/perfil', icon: UserCog },
        ],
    },
];

export default function AdminLayout({ title, children }) {
    const page = usePage();
    const { auth } = page.props;
    const sitio = useSitio();
    useTemaColores();
    const [abierto, setAbierto] = useState(false);

    const path = page.url.split('?')[0];
    const activo = (item) => (item.exacto ? path === item.href : path.startsWith(item.href));

    // Cerrar el menú móvil al navegar
    useEffect(() => {
        setAbierto(false);
    }, [page.url]);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Head title={`${title} - Panel ${sitio.empresa_nombre}`} />

            {/* Fondo oscuro del menú en celular */}
            <div
                aria-hidden="true"
                onClick={() => setAbierto(false)}
                className={cn(
                    'fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden',
                    abierto ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
            />

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-primary text-white transition-transform duration-300 lg:translate-x-0',
                    abierto ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
                    <Link href="/admin" className="flex items-center gap-3">
                        <img src={sitio.logo} alt={sitio.empresa_nombre} className="h-9 w-auto object-contain" />
                        <span className="text-xs font-semibold tracking-wider text-white/60 uppercase">Panel</span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setAbierto(false)}
                        aria-label="Cerrar menú"
                        className="flex size-9 items-center justify-center rounded-lg hover:bg-white/10 lg:hidden"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <nav aria-label="Panel" className="flex-1 overflow-y-auto px-3 py-4">
                    {menu.map((bloque, i) => (
                        <div key={i} className="mb-5">
                            {bloque.grupo && (
                                <p className="mb-2 px-3 text-[11px] font-bold tracking-wider text-white/40 uppercase">{bloque.grupo}</p>
                            )}
                            <ul className="flex flex-col gap-1">
                                {bloque.items.map((item) => {
                                    const contador = item.contador ? page.props[item.contador] : 0;
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                aria-current={activo(item) ? 'page' : undefined}
                                                className={cn(
                                                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                                                    activo(item)
                                                        ? 'bg-accent text-primary'
                                                        : 'text-white/75 hover:bg-white/10 hover:text-white',
                                                )}
                                            >
                                                <item.icon className="size-5 shrink-0" aria-hidden="true" />
                                                <span className="flex-1">{item.label}</span>
                                                {contador > 0 && (
                                                    <span
                                                        className={cn(
                                                            'rounded-full px-2 py-0.5 text-xs font-bold',
                                                            activo(item) ? 'bg-primary text-accent' : 'bg-accent text-primary',
                                                        )}
                                                    >
                                                        {contador}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                <div className="border-t border-white/10 p-3">
                    <div className="mb-2 px-3 py-2">
                        <p className="truncate text-sm font-semibold">{auth.user?.name}</p>
                        <p className="truncate text-xs text-white/60">{auth.user?.email}</p>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
                    >
                        <LogOut className="size-5" aria-hidden="true" /> Cerrar sesión
                    </Link>
                </div>
            </aside>

            <div className="lg:pl-72">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-gray-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
                    <button
                        type="button"
                        onClick={() => setAbierto(true)}
                        aria-label="Abrir menú"
                        aria-expanded={abierto}
                        className="flex size-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 lg:hidden"
                    >
                        <Menu className="size-6" />
                    </button>
                    <p className="truncate text-sm font-semibold text-gray-500">{title}</p>
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto flex shrink-0 items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-primary hover:text-primary"
                    >
                        <ExternalLink className="size-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Ver sitio</span>
                    </a>
                </header>

                <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    <div className="mx-auto max-w-6xl">{children}</div>
                </main>
            </div>
        </div>
    );
}
