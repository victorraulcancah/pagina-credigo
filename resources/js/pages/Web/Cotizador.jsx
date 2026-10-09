import { usePage } from '@inertiajs/react';
import { ArrowDown, Check, Info } from 'lucide-react';
import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import PaginaApi from '@/components/web/PaginaApi';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Icono from '@/components/ui/Icono';
import Section from '@/components/ui/Section';
import CotizacionForm from '@/components/web/CotizacionForm';
import { useSitio } from '@/hooks/useSitio';
import { resumenOpcion } from '@/lib/moneda';
import { cn } from '@/lib/utils';

function Paso({ numero, titulo, children }) {
    return (
        <div>
            <h2 className="mb-4 flex items-center gap-3 text-lg font-bold text-primary sm:text-xl">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm text-accent">{numero}</span>
                {titulo}
            </h2>
            {children}
        </div>
    );
}

function Fila({ etiqueta, valor }) {
    if (!valor) return null;

    return (
        <div className="flex items-baseline justify-between gap-4 border-b border-white/10 py-2.5 text-sm sm:text-base">
            <span className="text-primary-100">{etiqueta}</span>
            <span className="text-right font-semibold">{valor}</span>
        </div>
    );
}

/** Cotizador: el visitante elige plan y opción (montos cargados en el panel) y pide información. */
function CotizadorContenido({ secciones, planes }) {
    const { url } = usePage();
    const sitio = useSitio();
    const hero = secciones['cotizador.hero'];

    const planPedido = new URLSearchParams(url.split('?')[1] ?? '').get('plan');
    const [planId, setPlanId] = useState(() => (planes.find((p) => String(p.id) === planPedido) ?? planes[0])?.id);
    const plan = planes.find((p) => p.id === planId);

    const [opcionId, setOpcionId] = useState(plan?.opciones[0]?.id);
    const opcion = plan?.opciones.find((o) => o.id === opcionId) ?? plan?.opciones[0];

    const elegirPlan = (nuevo) => {
        setPlanId(nuevo.id);
        setOpcionId(nuevo.opciones[0]?.id);
    };

    const resumen = opcion ? resumenOpcion(opcion) : null;
    const asunto = plan && `Cotización: ${plan.titulo}`;
    const detalle =
        opcion &&
        [
            `Quiero cotizar: ${plan.titulo} — ${opcion.nombre}.`,
            resumen.inicial && `Inicial: ${resumen.inicial}`,
            resumen.cuota && `Cuota: ${resumen.cuota} ${resumen.frecuencia.periodo}${resumen.numeroCuotas ? ` × ${resumen.numeroCuotas}` : ''}`,
        ]
            .filter(Boolean)
            .join('\n');
    const whatsapp = opcion && sitio.whatsappUrl(`Hola, quiero cotizar ${plan.titulo} — ${opcion.nombre}`);

    return (
        <PublicLayout title="Cotizador" description={hero?.contenido}>
            <PageHero imagen={hero?.imagen_url} title={hero?.titulo || 'Cotizador'} description={hero?.contenido} />

            <Section background="muted">
                {!plan ? (
                    <Card className="mx-auto max-w-xl text-center">
                        <p className="text-lg font-semibold text-primary">Estamos preparando las opciones del cotizador.</p>
                        <p className="mt-2 text-primary-700/80">Mientras tanto, escríbenos y un asesor te da los montos.</p>
                        <Button href="/soporte" variant="secondary" className="mt-6">
                            Ir a soporte
                        </Button>
                    </Card>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
                        <div className="flex flex-col gap-10 lg:col-span-3">
                            <Paso numero="1" titulo="Elige tu plan">
                                <div className={cn('grid gap-3', planes.length > 1 && 'sm:grid-cols-2 xl:grid-cols-3')}>
                                    {planes.map((p) => {
                                        const activo = p.id === plan.id;
                                        return (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => elegirPlan(p)}
                                                aria-pressed={activo}
                                                className={cn(
                                                    'relative flex flex-col items-start gap-3 rounded-2xl bg-white p-5 text-left ring-2 transition',
                                                    activo ? 'ring-primary' : 'ring-transparent hover:ring-primary-200',
                                                )}
                                            >
                                                {activo && (
                                                    <span className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-primary text-accent">
                                                        <Check className="size-4" aria-hidden="true" />
                                                    </span>
                                                )}
                                                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
                                                    <Icono nombre={p.icono} className="size-6" />
                                                </span>
                                                <span>
                                                    {p.etiqueta && (
                                                        <span className="block text-xs font-bold tracking-wider text-primary-500 uppercase">{p.etiqueta}</span>
                                                    )}
                                                    <span className="block font-bold text-primary">{p.titulo}</span>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Paso>

                            <Paso numero="2" titulo="Elige una opción">
                                <div className="flex flex-col gap-3">
                                    {plan.opciones.map((o) => {
                                        const activa = o.id === opcion.id;
                                        const r = resumenOpcion(o);
                                        return (
                                            <button
                                                key={o.id}
                                                type="button"
                                                onClick={() => setOpcionId(o.id)}
                                                aria-pressed={activa}
                                                className={cn(
                                                    'flex items-center gap-4 rounded-2xl bg-white p-4 text-left ring-2 transition sm:p-5',
                                                    activa ? 'ring-primary' : 'ring-transparent hover:ring-primary-200',
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'flex size-6 shrink-0 items-center justify-center rounded-full border-2',
                                                        activa ? 'border-primary bg-primary text-accent' : 'border-primary-200',
                                                    )}
                                                >
                                                    {activa && <Check className="size-3.5" aria-hidden="true" />}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block font-bold text-primary">{o.nombre}</span>
                                                    {/* Si la inicial va en otra moneda (ej. US$ con cuotas en S/), se avisa aquí */}
                                                    {(o.nota || r.otraMoneda) && (
                                                        <span className="block text-sm text-primary-700/80">
                                                            {[o.nota, r.otraMoneda && `Inicial ${r.inicial}`].filter(Boolean).join(' · ')}
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="shrink-0 text-right">
                                                    {r.cuota ? (
                                                        <>
                                                            <span className="block text-lg font-extrabold text-primary">{r.cuota}</span>
                                                            <span className="block text-xs text-primary-500">{r.frecuencia.periodo}</span>
                                                        </>
                                                    ) : (
                                                        <span className="block text-xs font-semibold text-primary-500">Consulta la cuota</span>
                                                    )}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Paso>
                        </div>

                        {/* Resumen (fijo al hacer scroll en computadora) */}
                        <aside className="lg:col-span-2">
                            <div className="rounded-3xl bg-primary p-6 text-white shadow-xl sm:p-8 lg:sticky lg:top-24">
                                {plan.etiqueta && <p className="text-xs font-bold tracking-wider text-accent uppercase">{plan.etiqueta}</p>}
                                <p className="mt-1 text-2xl font-extrabold">{plan.titulo}</p>
                                <p className="text-primary-100">{opcion.nombre}</p>

                                <div className="my-6 rounded-2xl bg-white/10 p-5 text-center">
                                    {resumen.cuota ? (
                                        <>
                                            <p className="text-4xl font-extrabold text-accent sm:text-5xl">{resumen.cuota}</p>
                                            <p className="mt-1 text-sm text-primary-100">{resumen.frecuencia.periodo}</p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-primary-100">
                                            La cuota depende de tu evaluación.
                                            <br />
                                            Un asesor te da el monto exacto.
                                        </p>
                                    )}
                                </div>

                                <Fila etiqueta="Inicial / inscripción" valor={resumen.inicial} />
                                <Fila etiqueta="Número de cuotas" valor={resumen.numeroCuotas && `${resumen.numeroCuotas} ${resumen.frecuencia.plural}`} />
                                <Fila etiqueta="Total referencial" valor={resumen.total} />

                                <div className="mt-6 flex flex-col gap-3">
                                    <Button href="#solicitar" icon={ArrowDown} fullWidth>
                                        Solicitar este plan
                                    </Button>
                                    {whatsapp && (
                                        <Button href={whatsapp} newTab variant="outline-light" icon={FaWhatsapp} fullWidth>
                                            Consultar por WhatsApp
                                        </Button>
                                    )}
                                </div>

                                <p className="mt-5 flex gap-2 text-xs text-primary-200">
                                    <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                                    Montos referenciales. Las condiciones finales se definen en el contrato, luego de la evaluación.
                                </p>
                            </div>
                        </aside>
                    </div>
                )}
            </Section>

            {plan && (
                <Section id="solicitar">
                    <div className="mx-auto max-w-2xl">
                        <h2 className="text-2xl font-bold text-primary sm:text-3xl">Solicita tu plan</h2>
                        <p className="mt-2 text-primary-700/80">
                            Te interesa <strong className="text-primary">{plan.titulo} — {opcion.nombre}</strong>. Déjanos tus datos y un asesor te contacta.
                        </p>
                        <Card className="mt-6">
                            <CotizacionForm asunto={asunto} detalle={detalle} />
                        </Card>
                    </div>
                </Section>
            )}
        </PublicLayout>
    );
}

/** Cotizador: el contenido llega de la API (GET /api/paginas/cotizador). */
export default function Cotizador() {
    return <PaginaApi url="/paginas/cotizador">{(datos) => <CotizadorContenido {...datos} />}</PaginaApi>;
}
