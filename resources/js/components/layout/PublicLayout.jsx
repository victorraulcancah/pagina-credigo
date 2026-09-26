import { Head } from '@inertiajs/react';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import { useSitio, useTemaColores } from '@/hooks/useSitio';

/**
 * Layout de todas las páginas públicas.
 * <PublicLayout title="Nosotros" description="Texto para Google">...</PublicLayout>
 */
export default function PublicLayout({ title, description, children }) {
    const sitio = useSitio();
    useTemaColores();

    const tituloCompleto = title ? `${title} - ${sitio.empresa_nombre}` : sitio.empresa_nombre;
    const descripcion = description || sitio.empresa_descripcion;

    return (
        <div className="flex min-h-screen flex-col bg-white text-primary">
            <Head title={tituloCompleto}>
                {descripcion && <meta head-key="description" name="description" content={descripcion} />}
            </Head>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppButton />
        </div>
    );
}
