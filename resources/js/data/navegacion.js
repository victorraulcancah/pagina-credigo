/** Páginas del sitio público (lista simple: pie de página). El contenido de cada página se edita en /admin. */
export const navLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Nosotros', href: '/nosotros' },
    { label: 'Servicios', href: '/servicios' },
    { label: 'Talleres aliados', href: '/talleres' },
    { label: 'Beneficios', href: '/beneficios' },
    { label: 'Historias', href: '/historias' },
    { label: 'Blog', href: '/blog' },
    { label: 'Requisitos', href: '/requisitos' },
    { label: 'Cómo pagar', href: '/como-pagar' },
    { label: 'Cotizador', href: '/cotizador' },
    { label: 'Soporte', href: '/soporte' },
];

/**
 * Menú principal (Navbar). Las opciones con `items` abren un panel desplegable con
 * su `grupo` como título y una tarjeta `destacado` a la derecha
 * (`whatsapp: true` usa el WhatsApp configurado en el panel).
 * `planes: true`: antes de sus opciones van los planes visibles (cada uno a su página).
 * `exacto: true`: la opción se marca solo en esa página, no en sus subpáginas.
 * `ocultarEnLg: true`: entre 1024 y 1279 px no entra todo en una línea; "Inicio" se oculta
 * porque el logo ya lleva al inicio (en el menú del celular sí aparece).
 */
export const menuPrincipal = [
    { label: 'Inicio', href: '/', ocultarEnLg: true },
    { label: 'Nosotros', href: '/nosotros' },
    { label: 'Beneficios', href: '/beneficios' },
    { label: 'Historias', href: '/historias' },
    {
        label: 'Blog',
        grupo: 'Nuestro blog',
        items: [
            { label: 'Todo el blog', href: '/blog', exacto: true },
            { label: 'Eventos', href: '/blog/eventos' },
            { label: 'Noticias', href: '/blog/noticias' },
            { label: 'Tendencias', href: '/blog/tendencias' },
        ],
        destacado: {
            titulo: 'Lo último de CrediGo',
            texto: 'Eventos, noticias y tendencias para los conductores de aplicativo.',
            boton: 'Ir al blog',
            href: '/blog',
        },
    },
    {
        label: 'Planes',
        grupo: 'Nuestros planes',
        planes: true,
        items: [
            { label: 'Todos los planes', href: '/servicios', exacto: true },
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
