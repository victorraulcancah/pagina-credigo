/** Páginas del sitio público (lista simple: pie de página). El contenido de cada página se edita en /admin. */
export const navLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Nosotros', href: '/nosotros' },
    { label: 'Servicios', href: '/servicios' },
    { label: 'Talleres aliados', href: '/talleres' },
    { label: 'Beneficios', href: '/beneficios' },
    { label: 'Requisitos', href: '/requisitos' },
    { label: 'Cómo pagar', href: '/como-pagar' },
    { label: 'Cotizador', href: '/cotizador' },
    { label: 'Soporte', href: '/soporte' },
];

/**
 * Menú principal (Navbar). Las opciones con `items` abren un panel desplegable con
 * su `grupo` como título y una tarjeta `destacado` a la derecha
 * (`whatsapp: true` usa el WhatsApp configurado en el panel).
 */
export const menuPrincipal = [
    { label: 'Inicio', href: '/' },
    { label: 'Nosotros', href: '/nosotros' },
    { label: 'Beneficios', href: '/beneficios' },
    {
        label: 'Planes',
        grupo: 'Nuestros planes',
        items: [
            { label: 'Servicios y planes', href: '/servicios' },
            { label: 'Cotizador', href: '/cotizador' },
            { label: 'Talleres aliados', href: '/talleres' },
        ],
        destacado: {
            titulo: 'Cotiza en segundos',
            texto: 'Elige tu plan y mira tu cuota referencial al instante.',
            boton: 'Ir al cotizador',
            href: '/cotizador',
        },
    },
    {
        label: 'Cómo empezar',
        grupo: 'Empieza aquí',
        items: [
            { label: 'Cómo funciona', href: '/#como-funciona' },
            { label: 'Requisitos', href: '/requisitos' },
            { label: 'Cómo pagar', href: '/como-pagar' },
        ],
        destacado: {
            titulo: '¿Tienes dudas para inscribirte?',
            texto: 'Un asesor te explica los planes y requisitos sin compromiso.',
            boton: 'Hablar con un asesor',
            whatsapp: true,
        },
    },
    {
        label: 'Ayuda',
        grupo: 'Centros de ayuda',
        items: [
            { label: 'Soporte', href: '/soporte' },
            { label: 'Preguntas frecuentes', href: '/soporte#preguntas' },
            { label: 'Libro de Reclamaciones', href: '/libro-de-reclamaciones' },
            { label: 'Consultar mi reclamo', href: '/libro-de-reclamaciones/consultar' },
        ],
        destacado: {
            titulo: '¿Necesitas ayuda ahora?',
            texto: 'Escríbenos por WhatsApp y te respondemos lo antes posible.',
            boton: 'Escribir por WhatsApp',
            whatsapp: true,
        },
    },
];
