import { Link, usePage } from '@inertiajs/react';
import { LogIn, Mail, MapPin, Phone } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa6';
import Logo from '@/components/layout/Logo';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { empresa, navLinks, whatsappUrl } from '@/data/site';

const socialIcons = {
    facebook: { icon: FaFacebookF, label: 'Facebook' },
    instagram: { icon: FaInstagram, label: 'Instagram' },
    tiktok: { icon: FaTiktok, label: 'TikTok' },
};

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

export default function Footer() {
    const { props } = usePage();
    const redes = Object.entries(empresa.redes).filter(([, href]) => href);

    return (
        <footer className="bg-primary-950 text-primary-200">
            <div className="h-1.5 bg-accent" />
            <Container className="grid gap-10 py-14 sm:grid-cols-2 sm:py-16 lg:grid-cols-12 lg:gap-8">
                <div className="sm:col-span-2 lg:col-span-5">
                    <Logo />
                    <p className="mt-5 max-w-sm text-sm leading-relaxed">{empresa.descripcion}</p>
                    <div className="mt-6 flex gap-3">
                        <SocialLink href={whatsappUrl()} label="WhatsApp" icon={FaWhatsapp} />
                        {redes.map(([red, href]) => (
                            <SocialLink key={red} href={href} {...socialIcons[red]} />
                        ))}
                    </div>
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
                        <li>
                            <a href={`tel:+${empresa.whatsapp}`} className="flex items-start gap-3 transition hover:text-accent">
                                <Phone className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                                {empresa.telefono}
                            </a>
                        </li>
                        <li>
                            <a href={`mailto:${empresa.email}`} className="flex items-start gap-3 break-all transition hover:text-accent">
                                <Mail className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                                {empresa.email}
                            </a>
                        </li>
                        <li className="flex items-start gap-3">
                            <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                            <span>
                                {empresa.direccion}
                                <br />
                                {empresa.ciudad}
                            </span>
                        </li>
                    </ul>
                    <Button href={props.erpUrl} size="sm" icon={LogIn} className="mt-6">
                        Acceso al sistema
                    </Button>
                </div>
            </Container>

            <div className="border-t border-white/10">
                {/* pb/pr extra para que el botón flotante de WhatsApp no tape el texto */}
                <Container className="flex flex-col gap-1 pt-6 pb-24 text-center text-xs sm:flex-row sm:justify-between sm:pr-24 sm:pb-6 sm:text-left sm:text-sm lg:pr-28">
                    <p>
                        © {new Date().getFullYear()} {empresa.razonSocial} · RUC {empresa.ruc}
                    </p>
                    <p>Todos los derechos reservados.</p>
                </Container>
            </div>
        </footer>
    );
}
