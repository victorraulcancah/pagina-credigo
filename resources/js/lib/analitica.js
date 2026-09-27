/**
 * Eventos de analítica (Google Analytics 4 y píxel de Meta). Solo funcionan si
 * los IDs están configurados en Panel → SEO y marketing; si no, no hacen nada.
 */

/** Conversión: alguien envió una solicitud (contacto o cotizador). */
export function registrarLead(origen) {
    window.gtag?.('event', 'generate_lead', { lead_source: origen });
    window.fbq?.('track', 'Lead', { content_category: origen });
}

/**
 * Vista de página en la navegación sin recarga (Inertia). GA4 ya las cuenta sola
 * con su "medición mejorada"; el píxel de Meta necesita el aviso manual.
 */
export function registrarVisita(url) {
    if (url.startsWith('/admin') || url.startsWith('/login')) return;
    window.fbq?.('track', 'PageView');
}
