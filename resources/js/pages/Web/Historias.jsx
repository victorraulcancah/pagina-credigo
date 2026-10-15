import { ArrowRight, MessageSquareQuote } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import CtaSection from '@/components/web/CtaSection';
import PaginaApi from '@/components/web/PaginaApi';
import { Comentario, DatosConductor, FotoConductor } from '@/components/web/Testimonios';

/** Una historia como fila: foto del conductor, su comentario y su vehículo, entre líneas finas. */
function FilaHistoria({ testimonio, indice }) {
    return (
        <Revelar
            as="li"
            retraso={escalonar(indice, 80)}
            className="grid grid-cols-1 gap-6 py-10 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-8 lg:grid-cols-[11rem_minmax(0,1fr)_16rem] lg:items-center"
        >
            <FotoConductor
                testimonio={testimonio}
                alt={`Foto de ${testimonio.nombre}`}
                className="aspect-square w-32 rounded-2xl object-top text-4xl sm:w-full"
            />
            <figure className="min-w-0">
                <Comentario texto={testimonio.comentario} className="mt-3" />
                <figcaption className="mt-5">
                    <DatosConductor testimonio={testimonio} />
                </figcaption>
            </figure>
            {testimonio.foto_vehiculo_url && (
                <img
                    src={testimonio.foto_vehiculo_url}
                    alt={testimonio.vehiculo ? `Vehículo: ${testimonio.vehiculo}` : `Vehículo de ${testimonio.nombre}`}
                    loading="lazy"
                    className="max-h-44 w-full rounded-xl object-contain sm:col-start-2 lg:col-start-auto"
                />
            )}
        </Revelar>
    );
}

/** Mientras no haya historias publicadas: aviso y el siguiente paso (ver planes o cotizar). */
function SinHistorias() {
    return (
        <Revelar className="mx-auto flex max-w-2xl flex-col items-center border-y border-primary-100 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-accent">
                <MessageSquareQuote className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-6 text-2xl leading-tight font-bold tracking-[-0.02em] text-balance sm:text-3xl">
                Pronto compartiremos sus historias
            </h2>
            <p className="mt-3 max-w-lg text-lg text-pretty text-primary-700/80">
                Estamos reuniendo las experiencias de los conductores que ya recibieron su vehículo. Mientras tanto, conoce nuestros planes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href="/servicios" icon={ArrowRight} iconPosition="right">
                    Ver planes
                </Button>
                <Button href="/cotizador" variant="outline">
                    Cotiza tu plan
                </Button>
            </div>
        </Revelar>
    );
}

function HistoriasContenido({ secciones, testimonios }) {
    const hero = secciones['historias.hero'];

    return (
        <PublicLayout title={hero?.titulo || 'Historias de conductores'}>
            <PageHero imagen={hero?.imagen_url} colorTitulo={hero?.color_titulo} colorTexto={hero?.color_texto} title={hero?.titulo || 'Historias de conductores'} description={hero?.contenido} />

            <Section>
                {testimonios.length > 0 ? (
                    <ul className="divide-y divide-primary-100 border-y border-primary-100">
                        {testimonios.map((testimonio, i) => (
                            <FilaHistoria key={testimonio.id} testimonio={testimonio} indice={i} />
                        ))}
                    </ul>
                ) : (
                    <SinHistorias />
                )}
            </Section>

            <CtaSection seccion={secciones['general.cta']} whatsappPrimero />
        </PublicLayout>
    );
}

/** Historias de conductores: el contenido llega de la API (GET /api/paginas/historias). */
export default function Historias() {
    return <PaginaApi url="/paginas/historias">{(datos) => <HistoriasContenido {...datos} />}</PaginaApi>;
}
