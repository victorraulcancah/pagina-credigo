import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpenText,
    Briefcase,
    Building,
    Calculator,
    CircleQuestionMark,
    ExternalLink,
    FileText,
    Images,
    Inbox,
    LayoutDashboard,
    LayoutTemplate,
    Megaphone,
    Menu,
    Palette,
    PanelLeftClose,
    PanelLeftOpen,
    UserCog,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import MenuUsuario from '@/components/admin/MenuUsuario';
import { useCompartido } from '@/hooks/useCompartido';
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
            { label: 'Cotizador', href: '/admin/cotizador', icon: Calculator },
            { label: 'Preguntas frecuentes', href: '/admin/preguntas', icon: CircleQuestionMark },
            { label: 'Documentos', href: '/admin/documentos', icon: FileText },
        ],
    },
    {
        grupo: 'Contacto',
        items: [
            { label: 'Solicitudes', href: '/admin/mensajes', icon: Inbox, contador: 'mensajes_no_leidos' },
            { label: 'Reclamaciones', href: '/admin/reclamaciones', icon: BookOpenText, contador: 'reclamaciones_pendientes' },
        ],
    },
    {
        grupo: 'Configuración',
        items: [
            { label: 'Empresa y contacto', href: '/admin/configuracion/empresa', icon: Building },
            { label: 'Apariencia', href: '/admin/configuracion/apariencia', icon: Palette },
            { label: 'SEO y marketing', href: '/admin/configuracion/seo', icon: Megaphone },
            { label: 'Mi perfil', href: '/admin/perfil', icon: UserCog },
        ],
    },
];

// El menú contraído se recuerda en este navegador (preferencia personal)
const CLAVE_COLAPSADO = 'panel.menu-colapsado';

const leerColapsado = () => {
    try {
        return localStorage.getItem(CLAVE_COLAPSADO) === '1';
    } catch {
        return false;
    }
};

/**
 * Layout del panel. En computadora el menú lateral se contrae a solo íconos
 * (todas las clases de "colapsado" llevan lg:); en celular es un menú deslizable.
 */
export default function AdminLayout({ title, children }) {
    const page = usePage();
    const sitio = useSitio();
    useTemaColores();
    const [abierto, setAbierto] = useState(false);
    const [colapsado, setColapsado] = useState(leerColapsado);
    // Solicitudes sin leer y reclamaciones pendientes (GET /api/admin/contadores)
    const contadores = useCompartido('/admin/contadores', { siempre: true }) ?? {};

    const path = page.url.split('?')[0];
    const activo = (item) => (item.exacto ? path === item.href : path.startsWith(item.href));

    // Cerrar el menú móvil al navegar
    useEffect(() => {
        setAbierto(false);
    }, [page.url]);

    const alternarColapsado = () => {
        setColapsado((valor) => {
            try {
                localStorage.setItem(CLAVE_COLAPSADO, valor ? '0' : '1');
            } catch {
                // sin almacenamiento: solo dura esta visita
            }
            return !valor;
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Head title={`${title} - Panel ${sitio.empresa_nombre}`} />

            {/* Fondo oscuro del menú en celular */}
            <div
                aria-hidden="true"
                onClick={() => setAbierto(false)}
                className={cn('fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden', abierto ? 'opacity-100' : 'pointer-events-none opacity-0')}
            />

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex w-60 flex-col overflow-x-hidden bg-primary text-white transition-[width,translate] duration-300 ease-in-out lg:translate-x-0',
                    abierto ? 'translate-x-0' : '-translate-x-full',
                    colapsado && 'lg:w-18',
                )}
            >
                <div className={cn('flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4', colapsado && 'lg:justify-center lg:px-2')}>
                    <Link href="/admin" className="flex items-center gap-3" title={colapsado ? 'Dashboard' : undefined}>
                        <img src={sitio.logo} alt={sitio.empresa_nombre} className={cn('h-9 w-auto object-contain', colapsado && 'lg:max-w-14')} />
                        <span className={cn('text-xs font-semibold tracking-wider whitespace-nowrap text-white/60 uppercase transition-opacity', colapsado && 'lg:hidden')}>
                            Panel
                        </span>
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

                <nav aria-label="Panel" className="flex-1 overflow-x-hidden overflow-y-auto px-2 py-4">
                    {menu.map((bloque, i) => (
                        <div key={i} className="mb-5">
                            {bloque.grupo && (
                                <>
                                    <p className={cn('mb-2 px-2.5 text-[11px] font-bold tracking-wider whitespace-nowrap text-white/40 uppercase', colapsado && 'lg:hidden')}>
                                        {bloque.grupo}
                                    </p>
                                    {/* Contraído: una línea separa los grupos */}
                                    <div className={cn('mx-2 mb-3 hidden border-t border-white/10', colapsado && 'lg:block')} />
                                </>
                            )}
                            <ul className="flex flex-col gap-1">
                                {bloque.items.map((item) => {
                                    const contador = item.contador ? (contadores[item.contador] ?? 0) : 0;
                                    const esActivo = activo(item);
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                aria-current={esActivo ? 'page' : undefined}
                                                title={colapsado ? item.label : undefined}
                                                className={cn(
                                                    'flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-colors',
                                                    esActivo ? 'bg-accent text-primary' : 'text-white/75 hover:bg-white/10 hover:text-white',
                                                    colapsado && 'lg:justify-center lg:px-0',
                                                )}
                                            >
                                                <span className="relative shrink-0">
                                                    <item.icon className="size-5" aria-hidden="true" />
                                                    {/* Contraído: el contador pasa a ser un punto sobre el ícono */}
                                                    {contador > 0 && (
                                                        <span className={cn('absolute -top-1 -right-1 hidden size-2.5 rounded-full bg-accent ring-2 ring-primary', colapsado && 'lg:block')} />
                                                    )}
                                                </span>
                                                <span className={cn('flex-1 truncate whitespace-nowrap', colapsado && 'lg:hidden')}>{item.label}</span>
                                                {contador > 0 && (
                                                    <span
                                                        className={cn(
                                                            'rounded-full px-2 py-0.5 text-xs font-bold',
                                                            esActivo ? 'bg-primary text-accent' : 'bg-accent text-primary',
                                                            colapsado && 'lg:hidden',
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
            </aside>

            <div className={cn('transition-[padding] duration-300 ease-in-out lg:pl-60', colapsado && 'lg:pl-18')}>
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
                    <button
                        type="button"
                        onClick={alternarColapsado}
                        aria-label={colapsado ? 'Expandir menú' : 'Contraer menú'}
                        title={colapsado ? 'Expandir menú' : 'Contraer menú'}
                        className="hidden size-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-primary lg:flex"
                    >
                        {colapsado ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
                    </button>
                    <p className="truncate text-sm font-semibold text-gray-500">{title}</p>

                    <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver sitio"
                            className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-primary hover:text-primary"
                        >
                            <ExternalLink className="size-4" aria-hidden="true" />
                            <span className="hidden md:inline">Ver sitio</span>
                        </a>
                        <MenuUsuario />
                    </div>
                </header>

                <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    <div className="mx-auto max-w-6xl">{children}</div>
                </main>
            </div>
        </div>
    );
}
