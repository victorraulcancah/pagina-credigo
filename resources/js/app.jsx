import { createInertiaApp, router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { registrarVisita } from '@/lib/analitica';
import { toast } from '@/utils/sweetalert';
import '../css/app.css';

// Mensajes flash del backend (Inertia::flash('success' | 'error', '...')) → toast
router.on('flash', (event) => {
    const { success, error } = event.detail.flash ?? {};
    if (success) toast(success, 'success');
    if (error) toast(error, 'error');
});

// Analítica en navegación sin recarga (la primera vista ya la registra el script de la página)
let primeraVisita = true;
router.on('navigate', (event) => {
    if (primeraVisita) {
        primeraVisita = false;
        return;
    }
    registrarVisita(event.detail.page.url);
});

createInertiaApp({
    // Los layouts ya arman el título completo ("Página - Empresa")
    title: (title) => title,
    // Carga diferida: cada página es un archivo aparte (el visitante no descarga el panel)
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.jsx');
        const page = pages[`./pages/${name}.jsx`];
        if (!page) {
            throw new Error(`Página "${name}" no encontrada en ./pages/${name}.jsx`);
        }
        return page();
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#f8ec34',
    },
});
