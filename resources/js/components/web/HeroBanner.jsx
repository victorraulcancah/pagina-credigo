import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { useSitio } from '@/hooks/useSitio';
import { cn, SOMBRA_TEXTO } from '@/lib/utils';

const INTERVALO_MS = 6000;

/**
 * Carrusel principal de inicio (banners del panel): cada banner usa su imagen
 * como fondo a pantalla completa con el texto encima. Sin imagen se ve el
 * color de marca; sin banners muestra los datos de la empresa.
 */
export default function HeroBanner({ banners = [] }) {
    const sitio = useSitio();
    const whatsapp = sitio.whatsappUrl();

    const slides = banners.length
        ? banners
        : [{ id: 0, titulo: sitio.empresa_nombre, subtitulo: sitio.empresa_descripcion, boton_texto: 'Contáctanos', boton_url: '/contacto' }];

    const total = slides.length;
    const [actual, setActual] = useState(0);
    const [pausado, setPausado] = useState(false);
    const indice = actual % total;

    useEffect(() => {
        if (total < 2 || pausado) return;
        const id = setInterval(() => setActual((i) => (i + 1) % total), INTERVALO_MS);
        return () => clearInterval(id);
    }, [total, pausado]);

    const ir = (paso) => setActual((i) => (i + paso + total) % total);

    return (
        <section
            aria-roledescription="carrusel"
            aria-label="Destacados"
            className="relative flex min-h-[560px] items-center overflow-hidden bg-primary text-white sm:min-h-[620px] lg:min-h-[calc(100vh-4rem)]"
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
            onFocusCapture={() => setPausado(true)}
            onBlurCapture={() => setPausado(false)}
        >
            {/* Fondo de marca (se ve en los banners sin imagen) */}
            <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-32 size-96 resplandor-acento" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-32 size-96 resplandor-claro" />

            {/*
              Imagen de fondo de cada banner, tal cual se subió (sin capa oscura).
              Se cruzan con fundido; la activa hace un zoom lento. El zoom se
              reinicia recién cuando la imagen ya se ocultó (delay).
            */}
            {slides.map((slide, i) =>
                slide.imagen_url ? (
                    <div
                        key={slide.id}
                        aria-hidden="true"
                        className={cn('absolute inset-0 transition-opacity duration-1000', i === indice ? 'opacity-100' : 'opacity-0')}
                    >
                        <img
                            src={slide.imagen_url}
                            alt=""
                            fetchPriority={i === 0 ? 'high' : 'auto'}
                            className={cn(
                                'size-full object-cover transition-[scale] ease-out',
                                i === indice ? 'scale-100 duration-[7000ms]' : 'scale-110 delay-1000 duration-0',
                            )}
                        />
                    </div>
                ) : null,
            )}

            <Container className="relative py-16 sm:py-20 lg:py-24">
                {/* Todos los textos en la misma celda: el alto lo define el más largo */}
                <div className="grid">
                    {slides.map((slide, i) => {
                        const activa = i === indice;
                        const Titulo = i === 0 ? 'h1' : 'h2';

                        return (
                            <div
                                key={slide.id}
                                aria-hidden={!activa}
                                inert={!activa}
                                aria-roledescription="diapositiva"
                                aria-label={`${i + 1} de ${total}`}
                                className={cn(
                                    'max-w-3xl transition-all duration-700 [grid-area:1/1]',
                                    activa ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
                                )}
                            >
                                {sitio.empresa_eslogan && <Badge className="mb-5">{sitio.empresa_eslogan}</Badge>}
                                <Titulo
                                    className={cn(
                                        'text-4xl leading-tight font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl',
                                        slide.imagen_url && SOMBRA_TEXTO,
                                    )}
                                >
                                    {slide.titulo}
                                </Titulo>
                                {slide.subtitulo && (
                                    <p
                                        className={cn(
                                            'mt-5 max-w-2xl text-base text-pretty text-white/85 sm:text-lg lg:text-xl',
                                            slide.imagen_url && SOMBRA_TEXTO,
                                        )}
                                    >
                                        {slide.subtitulo}
                                    </p>
                                )}
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    {slide.boton_texto && slide.boton_url && (
                                        <Button href={slide.boton_url} size="lg" icon={ArrowRight} iconPosition="right">
                                            {slide.boton_texto}
                                        </Button>
                                    )}
                                    {whatsapp && (
                                        <Button href={whatsapp} newTab variant="outline-light" size="lg" icon={FaWhatsapp}>
                                            WhatsApp
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {total > 1 && (
                    <div className="mt-10 flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => ir(-1)}
                            aria-label="Anterior"
                            className="flex size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition hover:bg-white/20"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                        <div className="flex gap-2">
                            {slides.map((slide, i) => (
                                <button
                                    key={slide.id}
                                    type="button"
                                    onClick={() => setActual(i)}
                                    aria-label={`Ir a la diapositiva ${i + 1}`}
                                    aria-current={i === indice}
                                    className={cn(
                                        'h-2.5 rounded-full transition-all',
                                        i === indice ? 'w-8 bg-accent' : 'w-2.5 bg-white/40 hover:bg-white/70',
                                    )}
                                />
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => ir(1)}
                            aria-label="Siguiente"
                            className="flex size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition hover:bg-white/20"
                        >
                            <ChevronRight className="size-5" />
                        </button>
                    </div>
                )}
            </Container>
        </section>
    );
}
