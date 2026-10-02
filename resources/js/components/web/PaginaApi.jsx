import { usePage } from '@inertiajs/react';
import { LoaderCircle, RotateCw } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { useConsulta } from '@/hooks/useConsulta';

/** Claves de la API (cuota_semanal) como props de React (cuotaSemanal); solo el primer nivel. */
const aCamel = (datos) =>
    Object.fromEntries(Object.entries(datos ?? {}).map(([clave, valor]) => [clave.replace(/_([a-z])/g, (_, letra) => letra.toUpperCase()), valor]));

/**
 * Página pública que pide su contenido a la API (ej. GET /api/paginas/inicio) y se muestra cuando llega.
 * El título y la descripción ya vienen en el HTML del servidor (prop `seo`), así que Google y WhatsApp
 * los leen aunque el contenido llegue después.
 *
 * <PaginaApi url="/paginas/nosotros">{(datos) => <NosotrosContenido {...datos} />}</PaginaApi>
 */
export default function PaginaApi({ url, children }) {
    const { seo } = usePage().props;
    const consulta = useConsulta(url);

    if (consulta.datos === undefined) {
        return (
            <PublicLayout title={seo?.titulo} description={seo?.descripcion}>
                {/* Mientras llega: el azul de marca ocupa el lugar del encabezado (sin saltos al cargar) */}
                <section className="bg-primary text-white">
                    <Container className="flex min-h-[55vh] flex-col items-center justify-center gap-4 py-16 text-center">
                        {consulta.error ? (
                            <>
                                <p className="max-w-md text-lg text-white/80">{consulta.error}</p>
                                <Button variant="outline-light" icon={RotateCw} onClick={consulta.recargar}>
                                    Reintentar
                                </Button>
                            </>
                        ) : (
                            <LoaderCircle className="size-9 animate-spin text-accent" aria-label="Cargando" />
                        )}
                    </Container>
                </section>
            </PublicLayout>
        );
    }

    return children(aCamel(consulta.datos), consulta);
}
