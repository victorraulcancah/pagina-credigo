import { TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const DIAS = [
    ['L', 'lunes'],
    ['M', 'martes'],
    ['M', 'miércoles'],
    ['J', 'jueves'],
    ['V', 'viernes'],
    ['S', 'sábado'],
    ['D', 'domingo'],
];

const META = 5; // ticks de viajes entre martes y sábado

// Curva exponencial: arranca rápido y se asienta suave
const SUAVE = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

/** Cuántos días están encendidos: suben de 0 a 7 al cargar (todos de golpe si se pide reducir movimiento). */
function useEncendido() {
    // Con "reducir movimiento" la semana aparece completa desde el primer render
    const [quieto] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const [encendidos, setEncendidos] = useState(quieto ? DIAS.length : 0);

    useEffect(() => {
        if (quieto) return;
        let actual = 0;
        const intervalo = setInterval(() => {
            actual += 1;
            setEncendidos(actual);
            if (actual >= DIAS.length) clearInterval(intervalo);
        }, 140);
        return () => clearInterval(intervalo);
    }, [quieto]);

    return encendidos;
}

function Ticks({ llenos, encendido, className }) {
    return (
        <span className={cn('flex gap-1', className)} aria-hidden="true">
            {Array.from({ length: META }, (_, k) => (
                <span
                    key={k}
                    className={cn('h-1.5 flex-1 rounded-full transition-colors duration-700', SUAVE, encendido && k < llenos ? 'bg-accent' : 'bg-white/20')}
                />
            ))}
        </span>
    );
}

const PillHoy = ({ claro = false }) => (
    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase', claro ? 'bg-primary text-accent' : 'bg-accent text-primary')}>
        Hoy
    </span>
);

/**
 * La semana del conductor: lunes paga su cuota, de martes a sábado suma viajes,
 * el domingo su próxima cuota baja. Textos: sección inicio.semana (1.º lunes,
 * 2.º martes a sábado, 3.º domingo). `cuota`: monto real más bajo ya formateado.
 */
export default function Semana({ seccion, cuota }) {
    const encendidos = useEncendido();
    const hoy = (new Date().getDay() + 6) % 7; // 0 = lunes
    const [pago, viajes, descuento] = seccion?.items ?? [];
    const tramo = (i) => (i === 0 ? 'pago' : i === 6 ? 'descuento' : 'viajes');

    if (!pago) return null;

    return (
        <figure aria-label={seccion.titulo || 'Tu semana'} className="m-0">
            {/* Computadora y tablet: siete columnas */}
            <div className="hidden md:block">
                <div className="grid grid-cols-7 overflow-hidden rounded-2xl ring-1 ring-white/15">
                    {DIAS.map(([letra, nombre], i) => {
                        const encendido = i < encendidos;
                        const esPago = tramo(i) === 'pago';
                        return (
                            <div
                                key={nombre}
                                className={cn(
                                    'flex min-h-40 flex-col justify-between p-4 transition-[opacity,background-color] duration-700 lg:min-h-44 lg:p-5',
                                    SUAVE,
                                    i > 0 && 'border-l border-white/15',
                                    esPago ? 'bg-accent text-primary' : tramo(i) === 'descuento' ? 'bg-white/[0.09]' : 'bg-white/[0.03]',
                                    encendido ? 'opacity-100' : 'opacity-35',
                                )}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <span className="text-5xl leading-none font-black tracking-[-0.04em] lg:text-6xl">{letra}</span>
                                    {i === hoy && <PillHoy claro={esPago} />}
                                </div>
                                <div>
                                    <p className={cn('text-xs font-semibold tracking-wide uppercase', esPago ? 'text-primary/70' : 'text-white/60')}>{nombre}</p>
                                    {esPago && cuota && <p className="mt-1 text-lg leading-tight font-extrabold tabular-nums lg:text-xl">desde {cuota}</p>}
                                    {tramo(i) === 'viajes' && <Ticks llenos={i} encendido={encendido} className="mt-2.5" />}
                                    {tramo(i) === 'descuento' && (
                                        <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-accent">
                                            <TrendingDown className="size-4" aria-hidden="true" /> cuota baja
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 grid grid-cols-7 text-sm">
                    <Leyenda item={pago} className="py-1 pr-4" />
                    {viajes && <Leyenda item={viajes} className="col-span-5 border-l border-white/15 px-6 py-1 text-center [&>p]:mx-auto [&>p]:max-w-md" />}
                    {descuento && <Leyenda item={descuento} className="border-l border-white/15 py-1 pl-4" />}
                </div>
            </div>

            {/* Celular: tres filas, una por tramo de la semana */}
            <ol className="divide-y divide-white/15 overflow-hidden rounded-2xl ring-1 ring-white/15 md:hidden">
                <FilaCelular letras="L" hoy={hoy === 0} item={pago} destacado extra={cuota && `desde ${cuota}`} />
                {viajes && (
                    <FilaCelular letras="M–S" etiqueta="De martes a sábado" hoy={hoy > 0 && hoy < 6} item={viajes}>
                        <Ticks llenos={META} encendido={encendidos >= 6} className="mt-3 max-w-48" />
                    </FilaCelular>
                )}
                {descuento && <FilaCelular letras="D" hoy={hoy === 6} item={descuento} acento />}
            </ol>

            {seccion.contenido && <figcaption className="mt-4 text-xs text-white/60">{seccion.contenido}</figcaption>}
        </figure>
    );
}

function Leyenda({ item, className }) {
    return (
        <div className={className}>
            <p className="font-bold text-white">{item.titulo}</p>
            {item.descripcion && <p className="mt-0.5 text-white/70">{item.descripcion}</p>}
        </div>
    );
}

function FilaCelular({ letras, etiqueta, hoy, item, destacado = false, acento = false, extra, children }) {
    return (
        <li className={cn('flex gap-4 p-4', destacado ? 'bg-accent text-primary' : 'bg-white/[0.04]')}>
            <span aria-label={etiqueta} className="w-14 shrink-0 text-3xl leading-none font-black tracking-[-0.04em] whitespace-nowrap">
                {letras}
            </span>
            <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-bold">
                    <span className={cn(acento && 'text-accent')}>{item.titulo}</span>
                    {hoy && <PillHoy claro={destacado} />}
                </p>
                {extra && <p className="mt-0.5 text-lg font-extrabold tabular-nums">{extra}</p>}
                {item.descripcion && <p className={cn('mt-0.5 text-sm', destacado ? 'text-primary/75' : 'text-white/70')}>{item.descripcion}</p>}
                {children}
            </div>
        </li>
    );
}
