import { Link } from '@inertiajs/react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import Badge from '@/components/ui/Badge';
import Button, { usaEnlaceNativo } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { BotonVideo } from '@/components/web/Video';
import { useSitio } from '@/hooks/useSitio';
import { cn, SOMBRA_TEXTO } from '@/lib/utils';

const INTERVALO_MS = 6000;

/** Enlace que envuelve toda la imagen en los banners "solo imagen". */
function EnlaceBanner({ href, label, children }) {
    const clases = 'block size-full';

    return usaEnlaceNativo(href) ? (
        <a href={href} aria-label={label} className={clases}>
            {children}
        </a>
    ) : (
        <Link href={href} aria-label={label} className={clases}>
            {children}
        </Link>
    );
}

/**
 * Imagen de fondo de un banner, tal cual se subió (sin capa oscura).
 * - Con imagen para celular usa <picture> (se cambia en pantallas < 768 px).
 * - "Solo imagen" sin versión de celular: en celular se muestra completa (contain)
 *   para no recortar los textos del diseño; sin zoom.
 */
function ImagenFondo({ slide, activa, prioridad }) {
    const soloImagen = slide.solo_imagen;

    const imagen = (
        <picture className="block size-full">
            {slide.imagen_movil_url && <source media="(max-width: 767px)" srcSet={slide.imagen_movil_url} />}
            <img
                src={slide.imagen_url}
                alt={soloImagen ? slide.titulo : ''}
                fetchPriority={prioridad ? 'high' : 'auto'}
                className={cn(
                    'size-full',
                    soloImagen && !slide.imagen_movil_url ? 'object-contain md:object-cover' : 'object-cover',
                    // Zoom lento solo en fotos; los diseños con texto se muestran quietos
                    !soloImagen && 'transition-[scale] ease-out',
                    !soloImagen && (activa ? 'scale-100 duration-[7000ms]' : 'scale-110 delay-1000 duration-0'),
                )}
            />
        </picture>
    );

    return soloImagen && slide.boton_url ? (
        <EnlaceBanner href={slide.boton_url} label={slide.boton_texto || slide.titulo}>
            {imagen}
        </EnlaceBanner>
    ) : (
        imagen
    );
}

/**
 * Carrusel principal de inicio (banners del panel): cada banner usa su imagen
 * como fondo a pantalla completa con el texto encima. Sin imagen se ve el
 * color de marca; sin banners muestra los datos de la empresa.
 * Los banners "solo imagen" muestran el diseño sin texto encima (y es clicable).
 * `cifras`: items de la sección general.cifras, se muestran al pie del banner.
 */
export default function HeroBanner({ banners = [], cifras = [] }) {
    const sitio = useSitio();
    const whatsapp = sitio.whatsappUrl();

    const slides = banners.length
        ? banners
        : [{ id: 0, titulo: sitio.empresa_nombre, subtitulo: sitio.empresa_descripcion, boton_texto: 'Ir a soporte', boton_url: '/soporte' }];

    const total = slides.length;
    const [actual, setActual] = useState(0);
    const [pausado, setPausado] = useState(false);
    const indice = actual % total;
    const hayImagen = Boolean(slides[indice].imagen_url);
    const soloImagen = Boolean(slides[indice].solo_imagen && slides[indice].imagen_url);

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
            className="relative flex min-h-[560px] items-center overflow-clip bg-primary text-white sm:min-h-[620px] lg:min-h-[calc(100vh-4rem)]"
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
            onFocusCapture={() => setPausado(true)}
            onBlurCapture={() => setPausado(false)}
        >
            {/* Fondo de marca (se ve en los banners sin imagen) */}
            <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-32 size-96 resplandor-acento" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-32 size-96 resplandor-claro" />

            {/* Imágenes: se cruzan con fundido al cambiar de banner */}
            {slides.map((slide, i) =>
                slide.imagen_url ? (
                    <div
                        key={slide.id}
                        aria-hidden={i !== indice || !slide.solo_imagen}
                        inert={i !== indice}
                        className={cn('absolute inset-0 transition-opacity duration-1000', i === indice ? 'opacity-100' : 'opacity-0')}
                    >
                        <ImagenFondo slide={slide} activa={i === indice} prioridad={i === 0} />
                    </div>
                ) : null,
            )}

            {/* pointer-events-none: deja pasar el clic a la imagen de los banners "solo imagen" */}
            <Container className={cn('pointer-events-none relative py-16 sm:py-20 lg:py-24', total > 1 && 'pb-28 sm:pb-28 lg:pb-32')}>
                {/* Todos los textos en la misma celda: el alto lo define el más largo */}
                <div className="grid">
                    {slides.map((slide, i) => {
                        const activa = i === indice;
                        const Titulo = i === 0 ? 'h1' : 'h2';

                        // Diseño con sus propios textos: solo el título para lectores de pantalla
                        if (slide.solo_imagen && slide.imagen_url) {
                            return (
                                <Titulo key={slide.id} className="sr-only">
                                    {slide.titulo}
                                </Titulo>
                            );
                        }

                        return (
                            <div
                                key={slide.id}
                                aria-hidden={!activa}
                                inert={!activa}
                                aria-roledescription="diapositiva"
                                aria-label={`${i + 1} de ${total}`}
                                className={cn(
                                    'max-w-3xl transition-all duration-700 [grid-area:1/1]',
                                    activa ? 'pointer-events-auto translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                                )}
                            >
                                {(slide.etiqueta || sitio.empresa_eslogan) && (
                                    <Badge className="mb-5">{slide.etiqueta || sitio.empresa_eslogan}</Badge>
                                )}
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
                                    {/* Segundo botón del banner; si no tiene, WhatsApp */}
                                    {slide.boton2_texto && slide.boton2_url ? (
                                        <Button href={slide.boton2_url} variant="outline-light" size="lg">
                                            {slide.boton2_texto}
                                        </Button>
                                    ) : (
                                        whatsapp && (
                                            <Button href={whatsapp} newTab variant="outline-light" size="lg" icon={FaWhatsapp}>
                                                WhatsApp
                                            </Button>
                                        )
                                    )}
                                    {slide.video_url && <BotonVideo url={slide.video_url} titulo={slide.titulo} variant="outline-light" size="lg" />}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Cifras de la empresa (sección general.cifras); se ocultan sobre un diseño "solo imagen" */}
                {cifras.length > 0 && (
                    <div
                        aria-hidden={soloImagen}
                        className={cn(
                            'mt-10 grid max-w-3xl grid-cols-3 gap-4 border-t border-white/20 pt-8 transition-opacity duration-700 sm:gap-8',
                            hayImagen && SOMBRA_TEXTO,
                            soloImagen && 'opacity-0',
                        )}
                    >
                        {cifras.map((cifra, i) => (
                            <div key={i} className="min-w-0">
                                <p
                                    className={cn(
                                        'leading-tight font-extrabold text-accent',
                                        String(cifra.titulo).length > 6 ? 'text-base sm:text-2xl' : 'text-2xl sm:text-4xl',
                                    )}
                                >
                                    {cifra.titulo}
                                </p>
                                <p className="mt-1 text-xs text-white/80 sm:text-sm">{cifra.descripcion}</p>
                            </div>
                        ))}
                    </div>
                )}
            </Container>

            {/* Controles al pie del banner (no tapan el centro de los diseños) */}
            {total > 1 && (
                <div className="pointer-events-none absolute inset-x-0 bottom-6 sm:bottom-8">
                    <Container>
                        <div className="pointer-events-auto flex w-fit items-center gap-4">
                            <button
                                type="button"
                                onClick={() => ir(-1)}
                                aria-label="Anterior"
                                className="flex size-10 items-center justify-center rounded-full bg-black/25 backdrop-blur-sm transition hover:bg-black/40"
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
                                            'h-2.5 rounded-full shadow transition-all',
                                            i === indice ? 'w-8 bg-accent' : 'w-2.5 bg-white/60 hover:bg-white/90',
                                        )}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => ir(1)}
                                aria-label="Siguiente"
                                className="flex size-10 items-center justify-center rounded-full bg-black/25 backdrop-blur-sm transition hover:bg-black/40"
                            >
                                <ChevronRight className="size-5" />
                            </button>
                        </div>
                    </Container>
                </div>
            )}
        </section>
    );
}
