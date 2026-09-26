/**
 * Datos de la empresa y navegación de la web.
 * Centralizados aquí para que Navbar, Footer y páginas usen la misma fuente.
 */
export const empresa = {
    nombre: 'CrediGo',
    razonSocial: 'AREQUIPA GO S.A.C.',
    ruc: '20612112763',
    eslogan: 'Financiamiento para conductores de aplicativo',
    descripcion:
        'Impulsamos a los conductores de Yango e InDrive con financiamiento vehicular, celulares y productos para su trabajo diario.',
    telefono: '993 570 000',
    whatsapp: '51993570000',
    email: 'contacto@credigo.com',
    direccion: 'Av. Paseo de la Cultura Mz. K Lt. 15, Urb. El Cóndor',
    ciudad: 'José Luis Bustamante y Rivero, Arequipa',
    // Completar con las URLs reales; las vacías no se muestran.
    redes: {
        facebook: '',
        instagram: '',
        tiktok: '',
    },
};

export const navLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Nosotros', href: '/nosotros' },
    { label: 'Servicios', href: '/servicios' },
    { label: 'Contacto', href: '/contacto' },
];

export const whatsappUrl = (mensaje = 'Hola, quiero información sobre CrediGo') =>
    `https://wa.me/${empresa.whatsapp}?text=${encodeURIComponent(mensaje)}`;
