import { TrendingDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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

/**
 * Cuántos días están encendidos: suben de 0 a 7 cuando la franja entra en pantalla
 * (todos desde el inicio si se pide reducir movimiento).
 */
function useEncendido(ref) {
    const [quieto] = useState(() => !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const [encendidos, setEncendidos] = useState(quieto ? DIAS.length : 0);

    useEffect(() => {
        if (quieto || !ref.current) return;
        let intervalo;
        const observador = new IntersectionObserver(
            ([entrada]) => {
                if (!entrada.isIntersecting) return;
                observador.disconnect();
                let actual = 0;
                intervalo = setInterval(() => {
                    actual += 1;
                    setEncendidos(actual);
                    if (actual >= DIAS.length) clearInterval(intervalo);
                }, 140);
            },
            { threshold: 0.3 },
        );
        observador.observe(ref.current);
        return () => {
            observador.disconnect();
            clearInterval(intervalo);
        };
    }, [quieto, ref]);

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

const tramo = (i) => (i === 0 ? 'pago' : i === DIAS.length - 1 ? 'descuento' : 'viajes');

/**
 * La semana del conductor: lunes paga su cuota, de martes a sábado suma viajes,
 * el domingo su próxima cuota baja. Textos: sección beneficios.semana (1.º lunes,
 * 2.º martes a sábado, 3.º domingo). `cuota`: monto real más bajo ya formateado.
 */
export default function Semana({ seccion, cuota }) {
    const figura = useRef(null);
    const encendidos = useEncendido(figura);
    const hoy = (new Date().getDay() + 6) % 7; // 0 = lunes
    const [pago, viajes, descuento] = seccion?.items ?? [];

    if (!pago) return null;

    return (
        <figure ref={figura} aria-label={seccion.titulo || 'Tu semana'} className="m-0">
            {/* Computadora y tablet: siete columnas con la letra del día a gran escala */}
            <div className="hidden md:block">
                <div className="grid grid-cols-7 overflow-hidden rounded-2xl ring-1 ring-white/15">
                    {DIAS.map(([letra, nombre], i) => {
                        const encendido = i < encendidos;
                        const esPago = tramo(i) === 'pago';
                        return (
                            <div
                                key={nombre}
                                className={cn(
                                    'flex min-h-44 flex-col justify-between p-4 transition-[opacity,background-color] duration-700 lg:min-h-48 lg:p-5',
                                    SUAVE,
                                    i > 0 && 'border-l border-white/15',
                                    esPago ? 'bg-accent text-primary' : tramo(i) === 'descuento' ? 'bg-white/[0.09]' : 'bg-white/[0.03]',
                                    encendido ? 'opacity-100' : 'opacity-35',
                                )}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <span className="text-[4.5rem] leading-[0.8] font-bold tracking-[-0.04em] lg:text-[5.5rem] xl:text-[6rem]">{letra}</span>
                                    {i === hoy && <PillHoy claro={esPago} />}
                                </div>
                                <div>
                                    <p className={cn('text-xs font-semibold tracking-wide uppercase', esPago ? 'text-primary/70' : 'text-white/60')}>
                                        {esPago && cuota ? 'cuota desde' : nombre}
                                    </p>
                                    {esPago && cuota && <p className="mt-1 text-[1.75rem] leading-none font-bold tracking-[-0.02em] tabular-nums lg:text-[2rem]">{cuota}</p>}
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

            {/* Celular: una fila por día, que se encienden una a una igual que en computadora */}
            <ol className="divide-y divide-white/15 overflow-hidden rounded-2xl ring-1 ring-white/15 md:hidden">
                {DIAS.map(([letra, nombre], i) => {
                    const encendido = i < encendidos;
                    const esPago = tramo(i) === 'pago';
                    const item = i === 0 ? pago : i === 1 ? viajes : i === DIAS.length - 1 ? descuento : null;
                    return (
                        <li
                            key={nombre}
                            className={cn(
                                'grid grid-cols-[3rem_minmax(0,1fr)] items-start gap-3 px-4 py-3 transition-[opacity,background-color] duration-700',
                                SUAVE,
                                esPago ? 'bg-accent text-primary' : tramo(i) === 'descuento' ? 'bg-white/[0.09]' : 'bg-white/[0.03]',
                                encendido ? 'opacity-100' : 'opacity-35',
                            )}
                        >
                            <span className="text-[2.5rem] leading-[0.85] font-bold tracking-[-0.04em]">{letra}</span>
                            <div className="min-w-0 pt-0.5">
                                {/* El título manda; el nombre del día va al lado, nunca como rótulo encima */}
                                <p className="flex items-center justify-between gap-2">
                                    <span className="min-w-0">
                                        {item && <span className={cn('font-bold', tramo(i) === 'descuento' && 'text-accent')}>{item.titulo}</span>}
                                        <span
                                            className={cn(
                                                'text-xs font-semibold tracking-wide uppercase',
                                                item && 'ml-2',
                                                esPago ? 'text-primary/70' : 'text-white/60',
                                            )}
                                        >
                                            {nombre}
                                        </span>
                                    </span>
                                    {i === hoy && <PillHoy claro={esPago} />}
                                </p>
                                {esPago && cuota && (
                                    <p className="mt-1 text-sm">
                                        desde <span className="text-2xl leading-none font-bold tracking-[-0.02em] tabular-nums">{cuota}</span>
                                    </p>
                                )}
                                {item?.descripcion && <p className={cn('mt-1 text-sm', esPago ? 'text-primary/75' : 'text-white/70')}>{item.descripcion}</p>}
                                {tramo(i) === 'viajes' && <Ticks llenos={i} encendido={encendido} className="mt-2 max-w-40" />}
                            </div>
                        </li>
                    );
                })}
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
