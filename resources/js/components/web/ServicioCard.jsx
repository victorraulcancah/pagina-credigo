import Card from '@/components/ui/Card';
import Icono from '@/components/ui/Icono';

/** Tarjeta de servicio: con imagen arriba si tiene, si no solo el ícono. */
export default function ServicioCard({ servicio }) {
    return (
        <Card hover className="flex h-full flex-col overflow-hidden p-0 sm:p-0">
            {servicio.imagen_url && (
                <img src={servicio.imagen_url} alt={servicio.titulo} className="aspect-video w-full object-cover" />
            )}
            <div className="flex flex-1 flex-col p-6 sm:p-8">
                <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-accent text-primary sm:size-14">
                    <Icono nombre={servicio.icono} className="size-6 sm:size-7" />
                </div>
                <h3 className="text-lg font-bold text-primary sm:text-xl">{servicio.titulo}</h3>
                <p className="mt-2 text-sm whitespace-pre-line text-primary-700/80 sm:text-base">{servicio.descripcion}</p>
            </div>
        </Card>
    );
}
