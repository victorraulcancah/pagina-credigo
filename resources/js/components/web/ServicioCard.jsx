import { ArrowRight, Calculator, CircleCheck, MessageCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Icono from '@/components/ui/Icono';
import { useSitio } from '@/hooks/useSitio';
import { columnasLg } from '@/lib/utils';

/**
 * Columnas de la grilla de planes: con 5 o más, 3 por fila (tarjetas más anchas);
 * con 4, de 2 en 2 hasta pantallas grandes.
 */
export const columnasPlanes = (cantidad) => {
    if (cantidad >= 5) return 'lg:grid-cols-3';
    if (cantidad === 4) return 'lg:grid-cols-2 xl:grid-cols-4';
    return columnasLg(cantidad);
};

/**
 * Tarjeta de servicio/plan. Todas tienen la misma estructura para que se vean
 * alineadas: cabecera (imagen del plan o franja de marca con su ícono), etiqueta,
 * título, descripción, características y un botón al pie.
 */
export default function ServicioCard({ servicio }) {
    const sitio = useSitio();
    const caracteristicas = servicio.caracteristicas ?? [];
    const cotizable = servicio.opciones_count > 0;
    const asesor = sitio.whatsappUrl(`Hola, quiero información sobre el plan "${servicio.titulo}"`);

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white text-primary shadow-sm ring-1 ring-primary-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
            {/* Cabecera de igual altura en todas las tarjetas */}
            <div className="relative h-40 overflow-clip bg-primary sm:h-44">
                {servicio.imagen_url ? (
                    <img
                        src={servicio.imagen_url}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <>
                        <div aria-hidden="true" className="absolute -top-16 -right-16 size-56 resplandor-acento opacity-80" />
                        <Icono
                            nombre={servicio.icono}
                            className="absolute -right-4 -bottom-6 size-36 text-white/10 transition duration-500 group-hover:scale-110"
                        />
                    </>
                )}
                {servicio.etiqueta && (
                    <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold tracking-wide text-primary uppercase shadow-sm">
                        {servicio.etiqueta}
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col px-6 pb-6 sm:px-7 sm:pb-7">
                <span className="relative -mt-7 mb-4 flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary shadow-lg ring-4 ring-white">
                    <Icono nombre={servicio.icono} className="size-7" />
                </span>

                <h3 className="text-xl leading-snug font-bold sm:text-2xl">{servicio.titulo}</h3>
                {servicio.descripcion && <p className="mt-2 text-sm whitespace-pre-line text-primary-700/80 sm:text-base">{servicio.descripcion}</p>}

                {caracteristicas.length > 0 && (
                    <ul className="mt-5 flex flex-col gap-2.5 border-t border-primary-100 pt-5">
                        {caracteristicas.map((caracteristica, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm">
                                <CircleCheck className="mt-0.5 size-4.5 shrink-0 text-primary" aria-hidden="true" />
                                {caracteristica}
                            </li>
                        ))}
                    </ul>
                )}

                {/* Siempre hay una acción al pie: cotizar o hablar con un asesor */}
                <div className="mt-auto pt-6">
                    {cotizable ? (
                        <Button href={`/cotizador?plan=${servicio.id}`} variant="secondary" icon={Calculator} fullWidth>
                            Cotizar este plan
                        </Button>
                    ) : (
                        <Button
                            href={asesor ?? '/soporte'}
                            newTab={Boolean(asesor)}
                            variant="outline"
                            icon={asesor ? MessageCircle : ArrowRight}
                            iconPosition={asesor ? 'left' : 'right'}
                            fullWidth
                        >
                            Consultar con un asesor
                        </Button>
                    )}
                </div>
            </div>
        </article>
    );
}
