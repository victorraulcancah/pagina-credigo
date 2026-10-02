import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, LogOut, UserCog } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useUsuario } from '@/hooks/useCompartido';
import api from '@/lib/api';
import { cn, iniciales } from '@/lib/utils';

/** Usuario conectado en la barra superior del panel: perfil y cerrar sesión. */
export default function MenuUsuario() {
    const { url } = usePage();
    const [abierto, setAbierto] = useState(false);
    const ref = useRef(null);
    const usuario = useUsuario() ?? {};

    // POST /api/logout y vuelta al login con la página recargada (sin datos del panel en memoria)
    const cerrarSesion = async () => {
        try {
            await api.post('/logout');
        } finally {
            window.location.href = '/login';
        }
    };

    // Se cierra al navegar, al hacer clic fuera o con Escape
    useEffect(() => {
        setAbierto(false);
    }, [url]);

    useEffect(() => {
        if (!abierto) return;
        const clicFuera = (e) => !ref.current?.contains(e.target) && setAbierto(false);
        const tecla = (e) => e.key === 'Escape' && setAbierto(false);
        document.addEventListener('mousedown', clicFuera);
        document.addEventListener('keydown', tecla);
        return () => {
            document.removeEventListener('mousedown', clicFuera);
            document.removeEventListener('keydown', tecla);
        };
    }, [abierto]);

    const claseOpcion = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition';

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setAbierto((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={abierto}
                className="flex items-center gap-2.5 rounded-full py-1 pr-2 pl-1 transition hover:bg-gray-100"
            >
                <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-accent">{iniciales(usuario.name)}</span>
                <span className="hidden max-w-40 text-left sm:block">
                    <span className="block truncate text-sm leading-tight font-semibold text-gray-900">{usuario.name}</span>
                    <span className="block truncate text-xs leading-tight text-gray-500">{usuario.email}</span>
                </span>
                <ChevronDown className={cn('size-4 text-gray-400 transition-transform duration-200', abierto && 'rotate-180')} aria-hidden="true" />
            </button>

            <div
                role="menu"
                className={cn(
                    'absolute top-full right-0 z-50 mt-2 w-64 origin-top-right rounded-2xl bg-white p-2 shadow-xl ring-1 ring-gray-200 transition duration-150',
                    abierto ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0',
                )}
            >
                <div className="mb-1 flex items-center gap-3 border-b border-gray-100 px-3 pt-2 pb-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-accent">{iniciales(usuario.name)}</span>
                    <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-gray-900">{usuario.name}</span>
                        <span className="block truncate text-xs text-gray-500">{usuario.email}</span>
                    </span>
                </div>
                <Link href="/admin/perfil" role="menuitem" className={cn(claseOpcion, 'text-gray-700 hover:bg-gray-100')}>
                    <UserCog className="size-4.5" aria-hidden="true" /> Mi perfil
                </Link>
                <button type="button" onClick={cerrarSesion} role="menuitem" className={cn(claseOpcion, 'text-red-600 hover:bg-red-50')}>
                    <LogOut className="size-4.5" aria-hidden="true" /> Cerrar sesión
                </button>
            </div>
        </div>
    );
}
