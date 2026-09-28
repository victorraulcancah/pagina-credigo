import { BookOpenText, ShieldCheck } from 'lucide-react';

/** Encabezado en tarjeta de las páginas del Libro de Reclamaciones. */
export default function LibroEncabezado({ titulo = 'Libro de Reclamaciones', subtitulo }) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-primary-100">
            <div aria-hidden="true" className="h-1.5 bg-linear-to-r from-primary via-primary to-accent" />
            <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-accent shadow-lg shadow-primary/20 sm:size-16">
                        <BookOpenText className="size-7 sm:size-8" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h1 className="text-xl font-extrabold tracking-tight text-primary uppercase sm:text-2xl lg:text-3xl">{titulo}</h1>
                        {subtitulo && <p className="mt-1 text-sm text-primary-700/80 sm:text-base">{subtitulo}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-primary-50 px-4 py-3 ring-1 ring-primary-100 lg:max-w-sm">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                        <ShieldCheck className="size-5" aria-hidden="true" />
                    </span>
                    <p className="text-sm leading-snug text-primary-700">
                        Cumplimos con la normativa del <strong className="text-primary">Código de Protección y Defensa del Consumidor</strong> (Indecopi).
                    </p>
                </div>
            </div>
        </div>
    );
}
