import { Link } from '@inertiajs/react';
import { BookOpenText, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import Logo from '@/components/layout/Logo';
import Container from '@/components/ui/Container';
import { navLinks } from '@/data/navegacion';
import { useSitio } from '@/hooks/useSitio';

function SocialLink({ href, label, icon: Icon }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-accent hover:text-primary"
        >
            <Icon className="size-4" aria-hidden="true" />
        </a>
    );
}

function DatoContacto({ icon: Icon, href, children }) {
    const contenido = (
        <>
            <Icon className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
            <span className="min-w-0 break-words">{children}</span>
        </>
    );

    return (
        <li>
            {href ? (
                <a href={href} className="flex items-start gap-3 transition hover:text-accent">
                    {contenido}
                </a>
            ) : (
                <div className="flex items-start gap-3">{contenido}</div>
            )}
        </li>
    );
}

export default function Footer() {
    const sitio = useSitio();
    const whatsapp = sitio.whatsappUrl();

    return (
        <footer className="bg-primary-950 text-primary-200 print:hidden">
            <div className="h-1.5 bg-accent" />
            <Container className="grid gap-10 py-14 sm:grid-cols-2 sm:py-16 lg:grid-cols-12 lg:gap-8">
                <div className="sm:col-span-2 lg:col-span-5">
                    <Logo tamano="pie" />
                    {sitio.empresa_descripcion && (
                        <p className="mt-5 max-w-sm text-sm leading-relaxed">{sitio.empresa_descripcion}</p>
                    )}
                    {(whatsapp || sitio.redes.length > 0) && (
                        <div className="mt-6 flex flex-wrap gap-3">
                            {whatsapp && <SocialLink href={whatsapp} label="WhatsApp" icon={FaWhatsapp} />}
                            {sitio.redes.map((red) => (
                                <SocialLink key={red.clave} {...red} />
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-3">
                    <h3 className="text-sm font-bold tracking-wider text-white uppercase">Navegación</h3>
                    <ul className="mt-4 space-y-3 text-sm">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className="transition hover:text-accent">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="lg:col-span-4">
                    <h3 className="text-sm font-bold tracking-wider text-white uppercase">Contacto</h3>
                    <ul className="mt-4 space-y-3 text-sm">
                        {sitio.contacto_telefono && (
                            <DatoContacto icon={Phone} href={`tel:${sitio.contacto_telefono.replace(/\s/g, '')}`}>
                                {sitio.contacto_telefono}
                            </DatoContacto>
                        )}
                        {sitio.contacto_email && (
                            <DatoContacto icon={Mail} href={`mailto:${sitio.contacto_email}`}>
                                {sitio.contacto_email}
                            </DatoContacto>
                        )}
                        {(sitio.contacto_direccion || sitio.contacto_ciudad) && (
                            <DatoContacto icon={MapPin}>
                                {sitio.contacto_direccion}
                                {sitio.contacto_direccion && sitio.contacto_ciudad && <br />}
                                {sitio.contacto_ciudad}
                            </DatoContacto>
                        )}
                        {sitio.contacto_horario && <DatoContacto icon={Clock}>{sitio.contacto_horario}</DatoContacto>}
                    </ul>

                    {/* Acceso visible al Libro de Reclamaciones (obligatorio para Indecopi) */}
                    <Link
                        href="/libro-de-reclamaciones"
                        className="mt-6 inline-flex items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white transition hover:border-accent hover:text-accent"
                    >
                        <BookOpenText className="size-7 shrink-0" aria-hidden="true" />
                        <span className="text-left leading-tight">
                            <span className="block text-sm font-bold">Libro de Reclamaciones</span>
                            <span className="block text-xs text-primary-200">Registra tu reclamo o queja</span>
                        </span>
                    </Link>
                </div>
            </Container>

            <div className="border-t border-white/10">
                {/* pb/pr extra para que el botón flotante de WhatsApp no tape el texto */}
                <Container className="flex flex-col gap-2 pt-6 pb-24 text-center text-xs sm:flex-row sm:items-center sm:justify-between sm:pr-24 sm:pb-6 sm:text-left sm:text-sm lg:pr-28">
                    <p>
                        © {new Date().getFullYear()} {sitio.empresa_razon_social || sitio.empresa_nombre}
                        {sitio.empresa_ruc && ` · RUC ${sitio.empresa_ruc}`}
                    </p>
                    <nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                        <Link href="/terminos-y-condiciones" className="transition hover:text-accent">
                            Términos y condiciones
                        </Link>
                        <Link href="/politica-de-privacidad" className="transition hover:text-accent">
                            Política de privacidad
                        </Link>
                        <Link href="/libro-de-reclamaciones" className="transition hover:text-accent">
                            Libro de Reclamaciones
                        </Link>
                    </nav>
                </Container>
            </div>
        </footer>
    );
}
