import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, ChevronDown, LayoutDashboard, LogIn, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import Logo from '@/components/layout/Logo';
import Container from '@/components/ui/Container';
import { usaEnlaceNativo } from '@/components/ui/Button';
import { menuPrincipal } from '@/data/navegacion';
import { useSitio } from '@/hooks/useSitio';
import { cn } from '@/lib/utils';

const simples = menuPrincipal.filter((item) => !item.items);
const grupos = menuPrincipal.filter((item) => item.items);

/** Enlace interno con Inertia; los que llevan ancla (#) o son externos van nativos. */
function Enlace({ href, className, children, ...props }) {
    const externo = /^https?:/.test(href);

    return usaEnlaceNativo(href) ? (
        <a href={href} className={className} {...(externo && { target: '_blank', rel: 'noopener noreferrer' })} {...props}>
            {children}
        </a>
    ) : (
        <Link href={href} className={className} {...props}>
            {children}
        </Link>
    );
}

/** Tarjeta azul a la derecha del panel desplegable. */
function Destacado({ destacado, href, onClick }) {
    return (
        <div className="relative flex flex-col justify-between overflow-clip rounded-3xl bg-primary p-7 text-white">
            <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-20 size-52 resplandor-acento opacity-70" />
            <div className="relative">
                <p className="text-xl font-bold">{destacado.titulo}</p>
                <p className="mt-2 text-sm text-white/75">{destacado.texto}</p>
            </div>
            <Enlace
                href={href}
                onClick={onClick}
                className="relative mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-primary transition hover:brightness-95"
            >
                {destacado.whatsapp && <FaWhatsapp className="size-4" aria-hidden="true" />}
                {destacado.boton}
                <ArrowRight className="size-4" aria-hidden="true" />
            </Enlace>
        </div>
    );
}

/**
 * Barra superior azul de lado a lado con paneles desplegables por grupo.
 * En computadora los grupos se abren al pasar el mouse o con clic; en celular
 * todo va en un panel blanco que se abre con el botón de menú.
 */
export default function Navbar() {
    const { url, props } = usePage();
    const sitio = useSitio();
    const usuario = props.auth?.user;
    const [abierto, setAbierto] = useState(null); // grupo desplegado (label) o null
    const [contenido, setContenido] = useState(null); // se conserva durante la animación de cierre
    const [flecha, setFlecha] = useState(0);
    const [movil, setMovil] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const contenedor = useRef(null);
    const botones = useRef({});
    const temporizador = useRef(null);
    const fijado = useRef(false); // abierto con clic: no se cierra al sacar el mouse

    const path = url.split(/[?#]/)[0];
    const esActivo = (href) => {
        if (href.includes('#')) return false;
        return href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`);
    };
    const grupoActivo = (grupo) => grupo.items.some((item) => esActivo(item.href));
    const whatsapp = sitio.whatsappUrl();
    const destinoDestacado = (destacado) => (destacado.whatsapp ? (whatsapp ?? '/soporte') : destacado.href);

    const abrir = (grupo, conClic = false) => {
        clearTimeout(temporizador.current);
        fijado.current = conClic;
        const boton = botones.current[grupo.label];
        const caja = contenedor.current;
        if (boton && caja) {
            // La flechita del panel apunta al centro del botón abierto
            const b = boton.getBoundingClientRect();
            setFlecha(b.left + b.width / 2 - caja.getBoundingClientRect().left);
        }
        setContenido(grupo);
        setAbierto(grupo.label);
    };

    const cerrar = () => {
        clearTimeout(temporizador.current);
        setAbierto(null);
    };

    // Pequeña espera al salir con el mouse para poder bajar del botón al panel
    const programarCierre = () => {
        if (fijado.current) return;
        clearTimeout(temporizador.current);
        temporizador.current = setTimeout(() => setAbierto(null), 200);
    };

    // Al navegar se cierra todo
    useEffect(() => {
        setMovil(false);
        setAbierto(null);
    }, [url]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            clearTimeout(temporizador.current);
        };
    }, []);

    // Escape o clic fuera cierran el panel abierto
    useEffect(() => {
        if (!abierto && !movil) return;
        const tecla = (e) => {
            if (e.key !== 'Escape') return;
            setAbierto(null);
            setMovil(false);
        };
        const clicFuera = (e) => {
            if (contenedor.current?.contains(e.target)) return;
            setAbierto(null);
            setMovil(false);
        };
        document.addEventListener('keydown', tecla);
        document.addEventListener('mousedown', clicFuera);
        return () => {
            document.removeEventListener('keydown', tecla);
            document.removeEventListener('mousedown', clicFuera);
        };
    }, [abierto, movil]);

    const claseOpcion = (activo, desplegado = false) =>
        cn(
            // Más compacto en 1024 px para que entre todo en una línea
            'inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors xl:px-4',
            activo ? 'bg-accent text-primary' : desplegado ? 'bg-white/10 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white',
        );

    const claseMovil = (activo) =>
        cn('block rounded-xl px-4 py-3 text-base font-semibold transition-colors', activo ? 'bg-accent text-primary' : 'text-primary hover:bg-primary-50');

    return (
        <header
            ref={contenedor}
            onPointerLeave={(e) => e.pointerType === 'mouse' && abierto && programarCierre()}
            className={cn(
                'sticky top-0 z-50 bg-primary text-white transition-shadow duration-300 print:hidden',
                (scrolled || abierto || movil) && 'shadow-lg shadow-black/30',
            )}
        >
            <div className="relative">
                <Container className="flex h-14 items-center justify-between gap-3 sm:h-16">
                    <Logo className="h-8 sm:h-10" />

                    <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
                        {menuPrincipal.map((item) =>
                            item.items ? (
                                <button
                                    key={item.label}
                                    ref={(el) => (botones.current[item.label] = el)}
                                    type="button"
                                    // Si ya se abrió al pasar el mouse, el clic lo deja fijo; otro clic lo cierra
                                    onClick={() => (abierto === item.label && fijado.current ? cerrar() : abrir(item, true))}
                                    onPointerEnter={(e) => e.pointerType === 'mouse' && !fijado.current && abrir(item)}
                                    aria-expanded={abierto === item.label}
                                    aria-controls="menu-desplegable"
                                    className={claseOpcion(grupoActivo(item), abierto === item.label)}
                                >
                                    {item.label}
                                    <ChevronDown
                                        className={cn('size-4 transition-transform duration-200', abierto === item.label && 'rotate-180')}
                                        aria-hidden="true"
                                    />
                                </button>
                            ) : (
                                <Enlace
                                    key={item.href}
                                    href={item.href}
                                    onPointerEnter={(e) => e.pointerType === 'mouse' && !fijado.current && cerrar()}
                                    aria-current={esActivo(item.href) ? 'page' : undefined}
                                    className={claseOpcion(esActivo(item.href))}
                                >
                                    {item.label}
                                </Enlace>
                            ),
                        )}
                    </nav>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <Link
                            href={usuario ? '/admin' : '/login'}
                            title={usuario ? 'Ir al panel' : 'Acceso al sistema'}
                            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap text-white/85 transition hover:bg-white/10 hover:text-white lg:inline-flex"
                        >
                            {usuario ? <LayoutDashboard className="size-4" aria-hidden="true" /> : <LogIn className="size-4" aria-hidden="true" />}
                            {/* En 1024 px solo el ícono (el nombre queda para lectores de pantalla) */}
                            <span className="sr-only xl:not-sr-only">{usuario ? 'Ir al panel' : 'Acceso al sistema'}</span>
                        </Link>
                        <Link
                            href="/cotizador"
                            className="hidden h-10 items-center rounded-full bg-accent px-5 text-sm font-bold whitespace-nowrap text-primary transition hover:brightness-95 sm:inline-flex"
                        >
                            Cotiza tu plan
                        </Link>
                        <button
                            type="button"
                            onClick={() => setMovil((v) => !v)}
                            aria-expanded={movil}
                            aria-controls="menu-movil"
                            aria-label={movil ? 'Cerrar menú' : 'Abrir menú'}
                            className="inline-flex size-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none lg:hidden"
                        >
                            {movil ? <X className="size-6" /> : <Menu className="size-6" />}
                        </button>
                    </div>
                </Container>

                {/* Panel desplegable de computadora */}
                <div
                    id="menu-desplegable"
                    onPointerEnter={() => clearTimeout(temporizador.current)}
                    className={cn(
                        'absolute inset-x-0 top-full hidden pt-3 transition duration-200 lg:block',
                        abierto ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-2 opacity-0',
                    )}
                >
                    {contenido && (
                        <>
                            {/* Flechita que apunta a la opción abierta */}
                            <span
                                aria-hidden="true"
                                style={{ left: flecha }}
                                className="absolute top-1 z-10 size-4 -translate-x-1/2 rotate-45 rounded-[3px] bg-white transition-[left] duration-200"
                            />
                            {/* El panel ocupa el ancho del contenido, no toda la pantalla */}
                            <Container>
                                <div className="grid gap-10 rounded-[2rem] bg-white p-10 text-primary shadow-2xl shadow-black/25 ring-1 ring-primary-100 lg:grid-cols-[1fr_340px] xl:p-12">
                                    <div>
                                        <p className="text-xs font-bold tracking-wider text-primary-400 uppercase">{contenido.grupo}</p>
                                        <ul className="mt-6 grid w-max auto-cols-max grid-flow-col grid-rows-3 gap-x-20 gap-y-5">
                                            {contenido.items.map((sub) => (
                                                <li key={sub.href}>
                                                    <Enlace
                                                        href={sub.href}
                                                        onClick={cerrar}
                                                        aria-current={esActivo(sub.href) ? 'page' : undefined}
                                                        className={cn(
                                                            'group inline-flex items-center gap-2 text-xl transition hover:text-primary-500',
                                                            esActivo(sub.href) ? 'font-bold' : 'font-medium',
                                                        )}
                                                    >
                                                        {esActivo(sub.href) && <span className="size-2 rounded-full bg-accent ring-2 ring-primary" aria-hidden="true" />}
                                                        {sub.label}
                                                        <ArrowRight
                                                            className="size-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                                                            aria-hidden="true"
                                                        />
                                                    </Enlace>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    {contenido.destacado && (
                                        <Destacado destacado={contenido.destacado} href={destinoDestacado(contenido.destacado)} onClick={cerrar} />
                                    )}
                                </div>
                            </Container>
                        </>
                    )}
                </div>

                {/* Menú de celular y tablet */}
                <div
                    id="menu-movil"
                    inert={!movil}
                    className={cn(
                        'absolute inset-x-0 top-full px-3 pt-3 transition duration-200 sm:px-6 lg:hidden',
                        movil ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-2 opacity-0',
                    )}
                >
                    <nav
                        aria-label="Móvil"
                        className="max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-3xl bg-white p-3 text-primary shadow-2xl shadow-black/25 ring-1 ring-primary-100 sm:p-4"
                    >
                        <ul className="flex flex-col gap-1">
                            {simples.map((item) => (
                                <li key={item.href}>
                                    <Enlace href={item.href} aria-current={esActivo(item.href) ? 'page' : undefined} className={claseMovil(esActivo(item.href))}>
                                        {item.label}
                                    </Enlace>
                                </li>
                            ))}
                        </ul>
                        {grupos.map((grupo) => (
                            <div key={grupo.label} className="mt-3 border-t border-primary-100 pt-3">
                                <p className="px-4 pb-1 text-xs font-bold tracking-wider text-primary-400 uppercase">{grupo.grupo}</p>
                                <ul className="flex flex-col gap-1">
                                    {grupo.items.map((sub) => (
                                        <li key={sub.href}>
                                            <Enlace
                                                href={sub.href}
                                                onClick={() => setMovil(false)}
                                                aria-current={esActivo(sub.href) ? 'page' : undefined}
                                                className={claseMovil(esActivo(sub.href))}
                                            >
                                                {sub.label}
                                            </Enlace>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        <div className="mt-3 grid gap-2 border-t border-primary-100 pt-3 sm:grid-cols-2">
                            <Link
                                href="/cotizador"
                                className="flex h-12 items-center justify-center rounded-full bg-accent px-5 font-bold text-primary transition hover:brightness-95"
                            >
                                Cotiza tu plan
                            </Link>
                            <Link
                                href={usuario ? '/admin' : '/login'}
                                className="flex h-12 items-center justify-center gap-2 rounded-full border-2 border-primary px-5 font-bold text-primary transition hover:bg-primary hover:text-white"
                            >
                                {usuario ? <LayoutDashboard className="size-4" aria-hidden="true" /> : <LogIn className="size-4" aria-hidden="true" />}
                                {usuario ? 'Ir al panel' : 'Acceso al sistema'}
                            </Link>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}
