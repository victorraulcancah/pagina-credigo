import { Link } from '@inertiajs/react';
import { ArrowRight, Clock, Newspaper } from 'lucide-react';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import { cn } from '@/lib/utils';

/** Cada artículo vive dentro de su categoría: /blog/noticias/{slug}. */
export const urlArticulo = (articulo) => `/blog/${articulo.categoria?.slug}/${articulo.slug}`;

/** "12 de octubre de 2026" */
export const fechaArticulo = (iso) =>
    iso ? new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso)) : '';

/** Fecha y minutos de lectura: "12 de octubre de 2026 · 3 min de lectura". */
export function MetaArticulo({ articulo, className }) {
    return (
        <p className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-sm', className)}>
            <time dateTime={articulo.publicado_at}>{fechaArticulo(articulo.publicado_at)}</time>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden="true" /> {articulo.minutos_lectura} min de lectura
            </span>
        </p>
    );
}

/** Categoría como píldora. `claro`: sobre fondo azul o sobre la foto. */
export function ChipCategoria({ categoria, claro = false, className }) {
    if (!categoria) return null;

    return (
        <span
            className={cn(
                'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                claro ? 'bg-white/90 text-primary' : 'bg-primary-50 text-primary',
                className,
            )}
        >
            {categoria.nombre}
        </span>
    );
}

/** Portada del artículo; sin portada, el azul de marca con un ícono. */
export function PortadaArticulo({ articulo, className, imgClassName, prioridad = false }) {
    return (
        <div className={cn('overflow-hidden bg-primary', className)}>
            {articulo.portada_url ? (
                <img
                    src={articulo.portada_url}
                    alt=""
                    loading={prioridad ? 'eager' : 'lazy'}
                    fetchPriority={prioridad ? 'high' : 'auto'}
                    className={cn('size-full object-cover', imgClassName)}
                />
            ) : (
                <div aria-hidden="true" className={cn('relative flex size-full items-center justify-center', imgClassName)}>
                    <div className="absolute -top-16 -right-16 size-56 resplandor-acento" />
                    <Newspaper className="relative size-12 text-accent" />
                </div>
            )}
        </div>
    );
}

/**
 * Tarjeta de un artículo: portada con zoom al pasar el mouse, categoría, título, resumen,
 * fecha y "Leer más". Toda la tarjeta lleva al artículo. Entra animada una tras otra.
 */
export function TarjetaArticulo({ articulo, indice = 0 }) {
    return (
        <Revelar as="li" retraso={escalonar(indice, 90)} className="h-full">
            <Link
                href={urlArticulo(articulo)}
                className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-primary-100 transition duration-300 hover:ring-2 hover:ring-primary"
            >
                <div className="relative aspect-[16/10]">
                    <PortadaArticulo articulo={articulo} className="absolute inset-0" imgClassName="transition-transform duration-700 ease-out group-hover:scale-105" />
                    <ChipCategoria categoria={articulo.categoria} claro className="absolute top-4 left-4" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                    <MetaArticulo articulo={articulo} className="text-primary-700/70" />
                    <h3 className="mt-2 text-xl leading-snug font-bold tracking-[-0.01em] text-balance">
                        <span className="bg-[linear-gradient(var(--color-accent),var(--color-accent))] bg-[length:0%_0.35em] [box-decoration-break:clone] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_0.35em]">
                            {articulo.titulo}
                        </span>
                    </h3>
                    {articulo.resumen && <p className="mt-2 line-clamp-3 text-primary-700/80">{articulo.resumen}</p>}
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-bold">
                        Leer más
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                </div>
            </Link>
        </Revelar>
    );
}
