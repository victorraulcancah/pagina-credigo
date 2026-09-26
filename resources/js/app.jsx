import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';

createInertiaApp({
    title: (title) => (title ? `${title} - CrediGo` : 'CrediGo'),
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.jsx', { eager: true });
        const page = pages[`./pages/${name}.jsx`];
        if (!page) {
            throw new Error(`Página "${name}" no encontrada en ./pages/${name}.jsx`);
        }
        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#f4f750',
    },
});
