import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, LogIn, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Logo from '@/components/layout/Logo';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { navLinks } from '@/data/navegacion';
import { cn } from '@/lib/utils';

/** Botón al panel: "Acceso al sistema" o "Ir al panel" si ya inició sesión. */
function AccesoButton({ className, fullWidth = false, size }) {
    const { auth } = usePage().props;

    return auth.user ? (
        <Button href="/admin" variant="secondary" size={size} icon={LayoutDashboard} fullWidth={fullWidth} className={className}>
            Ir al panel
        </Button>
    ) : (
        <Button href="/login" variant="secondary" size={size} icon={LogIn} fullWidth={fullWidth} className={className}>
            Acceso al sistema
        </Button>
    );
}

export default function Navbar() {
    const { url } = usePage();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const path = url.split('?')[0];
    const isActive = (href) => (href === '/' ? path === '/' : path.startsWith(href));

    // Cerrar el menú móvil al navegar
    useEffect(() => {
        setOpen(false);
    }, [url]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open]);

    return (
        <header className={cn('sticky top-0 z-50 bg-accent text-primary transition-shadow duration-300', scrolled && 'shadow-lg shadow-black/20')}>
            <Container className="flex h-16 items-center justify-between gap-4 sm:h-20">
                <Logo />

                <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            aria-current={isActive(link.href) ? 'page' : undefined}
                            className={cn(
                                'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                                isActive(link.href)
                                    ? 'bg-primary text-accent'
                                    : 'text-primary/80 hover:bg-primary/10 hover:text-primary',
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <AccesoButton size="sm" className="hidden sm:inline-flex" />
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-controls="menu-movil"
                        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
                        className="inline-flex size-10 items-center justify-center rounded-full text-primary transition hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none lg:hidden"
                    >
                        {open ? <X className="size-6" /> : <Menu className="size-6" />}
                    </button>
                </div>
            </Container>

            {/* Menú móvil: se despliega con animación de altura */}
            <div
                id="menu-movil"
                inert={!open}
                className={cn(
                    'grid border-t border-primary/10 transition-[grid-template-rows] duration-300 lg:hidden',
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] border-transparent',
                )}
            >
                <div className="overflow-hidden">
                    <Container as="nav" aria-label="Móvil" className="flex flex-col gap-1 py-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={isActive(link.href) ? 'page' : undefined}
                                className={cn(
                                    'rounded-xl px-4 py-3 text-base font-semibold transition-colors',
                                    isActive(link.href)
                                        ? 'bg-primary text-accent'
                                        : 'text-primary/80 hover:bg-primary/10 hover:text-primary',
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <AccesoButton fullWidth className="mt-3 sm:hidden" />
                    </Container>
                </div>
            </div>
        </header>
    );
}
