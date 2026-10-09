import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa6';

const REDES = [
    { clave: 'redes_facebook', label: 'Facebook', icon: FaFacebookF },
    { clave: 'redes_instagram', label: 'Instagram', icon: FaInstagram },
    { clave: 'redes_tiktok', label: 'TikTok', icon: FaTiktok },
    { clave: 'redes_youtube', label: 'YouTube', icon: FaYoutube },
];

export const LOGO_POR_DEFECTO = '/images/logos/credigo.png';
export const LOGO_EMPRESA_POR_DEFECTO = '/images/logos/arequipa-go.png';

/**
 * Ajustes del sitio compartidos por el backend (HandleInertiaRequests → `sitio`),
 * con helpers para WhatsApp y redes sociales.
 */
export function useSitio() {
    const { sitio } = usePage().props;

    const whatsappUrl = (mensaje = sitio.contacto_whatsapp_mensaje) =>
        sitio.contacto_whatsapp
            ? `https://wa.me/${sitio.contacto_whatsapp}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ''}`
            : null;

    return {
        ...sitio,
        logo: sitio.logo_url || LOGO_POR_DEFECTO,
        logoEmpresa: sitio.logo_empresa_url || LOGO_EMPRESA_POR_DEFECTO,
        redes: REDES.filter((red) => sitio[red.clave]).map((red) => ({ ...red, href: sitio[red.clave] })),
        whatsappUrl,
    };
}

/** Aplica los colores de marca guardados en la BD (se actualizan sin recargar). */
export function useTemaColores() {
    const { sitio } = usePage().props;

    useEffect(() => {
        const estilo = document.documentElement.style;
        estilo.setProperty('--color-primary', sitio.color_primario);
        estilo.setProperty('--color-accent', sitio.color_acento);
    }, [sitio.color_primario, sitio.color_acento]);
}
