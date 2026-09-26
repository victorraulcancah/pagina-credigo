import { CircleCheck } from 'lucide-react';
import Card from '@/components/ui/Card';
import Icono from '@/components/ui/Icono';

/**
 * Tarjeta de servicio/plan: imagen opcional arriba, ícono, etiqueta,
 * título, descripción y su lista de características.
 */
export default function ServicioCard({ servicio }) {
    const caracteristicas = servicio.caracteristicas ?? [];

    return (
        <Card hover className="flex h-full flex-col overflow-hidden p-0 sm:p-0">
            {servicio.imagen_url && (
                <img src={servicio.imagen_url} alt={servicio.titulo} className="aspect-video w-full object-cover" />
            )}
            <div className="flex flex-1 flex-col p-6 sm:p-8">
                <div className="mb-5 flex items-center gap-3">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary sm:size-14">
                        <Icono nombre={servicio.icono} className="size-6 sm:size-7" />
                    </span>
                    {servicio.etiqueta && (
                        <span className="text-xs font-bold tracking-wider text-primary-500 uppercase">{servicio.etiqueta}</span>
                    )}
                </div>
                <h3 className="text-xl font-bold text-primary sm:text-2xl">{servicio.titulo}</h3>
                <p className="mt-2 text-sm whitespace-pre-line text-primary-700/80 sm:text-base">{servicio.descripcion}</p>

                {caracteristicas.length > 0 && (
                    <ul className="mt-6 flex flex-col gap-3 border-t border-primary-100 pt-6">
                        {caracteristicas.map((caracteristica, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-primary sm:text-base">
                                <CircleCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                                {caracteristica}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Card>
    );
}
