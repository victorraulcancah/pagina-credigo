import { ArrowRight } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import PaginaApi from '@/components/web/PaginaApi';
import Button from '@/components/ui/Button';
import Icono from '@/components/ui/Icono';
import Revelar from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import CtaSection from '@/components/web/CtaSection';
import DatosNivel from '@/components/web/DatosNivel';
import FaqSection from '@/components/web/FaqSection';
import HeroBanner from '@/components/web/HeroBanner';
import ListaPlanes from '@/components/web/ListaPlanes';
import Recorrido from '@/components/web/Recorrido';
import TestimoniosSection from '@/components/web/Testimonios';
import TituloSeccion from '@/components/web/TituloSeccion';
import { cn } from '@/lib/utils';

/** Planes del inicio: encabezado con su botón y la lista de planes destacados. */
function Planes({ encabezado, servicios }) {
    if (!servicios.length) return null;

    return (
        <Section id="planes">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <Revelar>
                    <TituloSeccion titulo={encabezado?.titulo || 'Nuestros planes'} contenido={encabezado?.contenido} />
                </Revelar>
                {encabezado?.boton_texto && encabezado?.boton_url && (
                    <Button href={encabezado.boton_url} variant="outline" icon={ArrowRight} iconPosition="right" className="self-start lg:self-end">
                        {encabezado.boton_texto}
                    </Button>
                )}
            </div>
            <ListaPlanes servicios={servicios} className="mt-12 divide-y divide-primary-100 border-y border-primary-100" />
        </Section>
    );
}

// Escala de la marca para los niveles: de azul claro a azul medio, y amarillo solo para el más alto
const ESCALA_MEDALLAS = ['bg-primary-100 text-primary', 'bg-primary-200 text-primary', 'bg-primary-300 text-primary'];

// Columnas según cuántos niveles hay (los trae el ERP: hoy son 4, pero pueden ser más o menos)
const COLUMNAS_NIVELES = { 1: '', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2 lg:grid-cols-4' };

/** Niveles como una sola barra de progreso dividida en tramos. */
function Niveles({ seccion }) {
    const niveles = seccion?.items ?? [];
    if (!niveles.length) return null;

    return (
        <Section>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <Revelar>
                    <TituloSeccion titulo={seccion.titulo} contenido={seccion.contenido} />
                </Revelar>
                <Button href="/beneficios" variant="outline" icon={ArrowRight} iconPosition="right" className="self-start lg:self-end">
                    Ver beneficios
                </Button>
            </div>

            <Revelar desde="zoom" className="mt-12 overflow-hidden rounded-2xl ring-1 ring-primary-100">
                {/* gap-px sobre fondo claro dibuja las líneas entre niveles, vengan los que vengan */}
                <div className={cn('grid gap-px bg-primary-100', COLUMNAS_NIVELES[niveles.length] ?? 'md:grid-cols-2 lg:grid-cols-3')}>
                    {niveles.map((nivel, i) => {
                        const ultimo = i === niveles.length - 1;
                        return (
                            <div key={i} className={cn('flex flex-col p-6 sm:p-8', ultimo ? 'bg-primary text-white' : 'bg-white')}>
                                <span className={cn('mb-5 flex size-12 items-center justify-center rounded-full', ultimo ? 'bg-accent text-primary' : ESCALA_MEDALLAS[Math.min(i, ESCALA_MEDALLAS.length - 1)])}>
                                    {nivel.imagen_url ? <img src={nivel.imagen_url} alt="" loading="lazy" className="size-full rounded-full object-contain" /> : <Icono nombre={nivel.icono} fallback="Medal" className="size-6" />}
                                </span>
                                <h3 className="text-2xl font-bold">{nivel.titulo}</h3>
                                <DatosNivel nivel={nivel} claro={ultimo} className="mt-2" />
                                {nivel.descripcion && <p className={cn('mt-2 text-sm sm:text-base', ultimo ? 'text-white/75' : 'text-primary-700/80')}>{nivel.descripcion}</p>}
                                {/* Tramo de la barra: se llena hasta este nivel */}
                                <span aria-hidden="true" className="mt-auto flex gap-1 pt-6">
                                    {niveles.map((_, k) => (
                                        <span key={k} className={cn('h-1.5 flex-1 rounded-full', k <= i ? (ultimo ? 'bg-accent' : 'bg-primary') : ultimo ? 'bg-white/20' : 'bg-primary-100')} />
                                    ))}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </Revelar>
        </Section>
    );
}

/** Resumen de Nosotros sobre el azul de marca. Con imagen del panel, a dos columnas; sin imagen, solo texto. */
function Nosotros({ seccion }) {
    if (!seccion) return null;
    const conImagen = Boolean(seccion.imagen_url);

    return (
        <Section background="dark">
            <div className={cn('grid items-center gap-10 lg:gap-16', conImagen && 'lg:grid-cols-2')}>
                <Revelar desde="izquierda" className={cn(!conImagen && 'max-w-3xl')}>
                    <TituloSeccion titulo={seccion.titulo} contenido={seccion.contenido} claro />
                    {seccion.boton_texto && seccion.boton_url && (
                        <Button href={seccion.boton_url} variant="primary" icon={ArrowRight} iconPosition="right" className="mt-8">
                            {seccion.boton_texto}
                        </Button>
                    )}
                </Revelar>
                {conImagen && (
                    <Revelar desde="derecha" retraso={150}>
                        <img src={seccion.imagen_url} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />
                    </Revelar>
                )}
            </div>
        </Section>
    );
}

/**
 * Inicio: carrusel de banners del panel arriba y luego planes, recorrido, niveles, historias
 * de conductores y cierre. Todo el contenido viene del panel.
 */
function InicioContenido({ banners, secciones, servicios, preguntas, testimonios, totalTestimonios }) {
    const faq = secciones['general.faq'];

    return (
        <PublicLayout>
            <HeroBanner banners={banners} cifras={secciones['general.cifras']?.items ?? []} />
            <Planes encabezado={secciones['inicio.servicios']} servicios={servicios} />
            <Recorrido id="como-funciona" seccion={secciones['inicio.como_funciona']} />
            <Niveles seccion={secciones['general.beneficios']} />
            <TestimoniosSection seccion={secciones['inicio.testimonios']} testimonios={testimonios} total={totalTestimonios} />
            <Nosotros seccion={secciones['inicio.nosotros']} />
            <FaqSection seccion={faq && { ...faq, subtitulo: null }} preguntas={preguntas} />
            <CtaSection seccion={secciones['general.cta']} whatsappPrimero />
        </PublicLayout>
    );
}

/** Inicio: el contenido llega de la API (GET /api/paginas/inicio). */
export default function Inicio() {
    return <PaginaApi url="/paginas/inicio">{(datos) => <InicioContenido {...datos} />}</PaginaApi>;
}
