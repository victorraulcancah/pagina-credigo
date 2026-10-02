import { Link } from '@inertiajs/react';
import { Calculator, Check, MessageCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Icono from '@/components/ui/Icono';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import { useSitio } from '@/hooks/useSitio';
import { cuotaMasBaja, FRECUENCIAS, formatoMoneda } from '@/lib/moneda';

/**
 * Planes como lista con líneas (no tarjetas): cada fila dice qué es (enlace a su página),
 * qué incluye, desde cuánto y qué hacer. Los planes llegan con sus `opciones` visibles
 * y `opciones_count` (para mostrar Cotizar o Consultar).
 */
export default function ListaPlanes({ servicios, className }) {
    const sitio = useSitio();
    if (!servicios.length) return null;

    return (
        <ul className={className ?? 'divide-y divide-primary-100 border-y border-primary-100'}>
            {servicios.map((servicio, i) => {
                const menor = cuotaMasBaja(servicio.opciones ?? []);
                const asesor = sitio.whatsappUrl(`Hola, quiero información sobre el plan "${servicio.titulo}"`);
                const caracteristicas = (servicio.caracteristicas ?? []).slice(0, 3);

                return (
                    <Revelar
                        as="li"
                        key={servicio.id}
                        retraso={escalonar(i, 80)}
                        className="grid gap-5 py-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_13rem] lg:items-center lg:gap-10"
                    >
                        <div className="flex gap-4">
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-accent">
                                <Icono nombre={servicio.icono} className="size-6" />
                            </span>
                            <div className="min-w-0">
                                <h3 className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xl leading-snug font-bold sm:text-2xl">
                                    <Link href={`/servicios/${servicio.slug}`} className="hover:underline">
                                        {servicio.titulo}
                                    </Link>
                                    {servicio.etiqueta && <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-primary">{servicio.etiqueta}</span>}
                                </h3>
                                {servicio.descripcion && <p className="mt-1.5 text-primary-700/80">{servicio.descripcion}</p>}
                            </div>
                        </div>

                        {caracteristicas.length > 0 ? (
                            <ul className="flex flex-col gap-2 text-sm text-primary-800">
                                {caracteristicas.map((caracteristica, k) => (
                                    <li key={k} className="flex items-start gap-2">
                                        <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                                        {caracteristica}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <span className="hidden lg:block" />
                        )}

                        <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end lg:text-right">
                            {menor ? (
                                <p className="leading-tight">
                                    <span className="block text-xs font-semibold tracking-wide text-primary-500 uppercase">Cuota desde</span>
                                    <span className="text-2xl font-bold tabular-nums">{formatoMoneda(menor.cuota, menor.moneda)}</span>
                                    <span className="ml-1 text-sm text-primary-500">{FRECUENCIAS[menor.frecuencia]?.periodo}</span>
                                </p>
                            ) : (
                                <span className="hidden lg:block" />
                            )}
                            {servicio.opciones_count > 0 ? (
                                <Button href={`/cotizador?plan=${servicio.id}`} variant="secondary" size="sm" icon={Calculator}>
                                    Cotizar
                                </Button>
                            ) : (
                                <Button href={asesor ?? '/soporte'} newTab={Boolean(asesor)} variant="outline" size="sm" icon={MessageCircle}>
                                    Consultar
                                </Button>
                            )}
                        </div>
                    </Revelar>
                );
            })}
        </ul>
    );
}
