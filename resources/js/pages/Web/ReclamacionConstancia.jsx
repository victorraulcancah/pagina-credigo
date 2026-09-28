import { CircleCheckBig, Printer, Search } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Section from '@/components/ui/Section';
import { formatoFecha } from '@/lib/fechas';
import { ETIQUETA_ADJUNTO, filasHoja, tamanoArchivo } from '@/lib/reclamacion';

function Fila({ etiqueta, children }) {
    if (!children) return null;

    return (
        <div className="grid gap-1 border-b border-primary-100 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-semibold text-primary-500">{etiqueta}</dt>
            <dd className="whitespace-pre-line text-primary sm:col-span-2">{children}</dd>
        </div>
    );
}

/** Constancia de la hoja de reclamación registrada (imprimible). */
export default function ReclamacionConstancia({ reclamacion, diasRespuesta }) {
    const r = reclamacion;

    return (
        <PublicLayout title={`Hoja de reclamación N° ${r.codigo}`}>
            <Section background="muted">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-6 flex flex-col items-center gap-3 text-center print:hidden">
                        <CircleCheckBig className="size-14 text-green-600" aria-hidden="true" />
                        <h1 className="text-3xl font-extrabold text-primary sm:text-4xl">Registramos tu {r.tipo}</h1>
                        <p className="max-w-xl text-primary-700/80">
                            Enviamos una copia a <strong>{r.email}</strong>. Te responderemos en un plazo no mayor a {diasRespuesta} días hábiles
                            (hasta el {formatoFecha(r.fecha_limite + 'T12:00:00', false)}).
                        </p>
                        <p className="max-w-xl text-sm text-primary-700/80">
                            Guarda tu número de hoja <strong>{r.codigo}</strong>: con él y tu documento puedes consultar el estado de tu {r.tipo}.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Button variant="outline" icon={Printer} onClick={() => window.print()}>
                                Imprimir o guardar como PDF
                            </Button>
                            <Button href="/libro-de-reclamaciones/consultar" variant="secondary" icon={Search}>
                                Consultar mi reclamo
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <div className="mb-4 flex flex-col gap-1 border-b-2 border-primary pb-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-bold tracking-wider text-primary-500 uppercase">Libro de Reclamaciones</p>
                                <p className="text-2xl font-extrabold text-primary">Hoja N° {r.codigo}</p>
                            </div>
                            <p className="text-sm text-primary-700/80">{formatoFecha(r.created_at)}</p>
                        </div>

                        <dl>
                            <Fila etiqueta="Proveedor">
                                {r.proveedor.razon_social}
                                {r.proveedor.ruc && ` — RUC ${r.proveedor.ruc}`}
                                {r.proveedor.direccion && `\n${r.proveedor.direccion}`}
                            </Fila>
                            {filasHoja(r).map(([etiqueta, valor]) => (
                                <Fila key={etiqueta} etiqueta={etiqueta}>
                                    {valor}
                                </Fila>
                            ))}
                            {r.adjuntos?.length > 0 && (
                                <Fila etiqueta="Archivos adjuntos">
                                    {r.adjuntos.map((a) => `${ETIQUETA_ADJUNTO[a.tipo]}: ${a.nombre_original} (${tamanoArchivo(a.tamano)})`).join('\n')}
                                </Fila>
                            )}
                        </dl>

                        <p className="mt-6 text-xs text-primary-700/70">
                            La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer
                            una denuncia ante el INDECOPI.
                        </p>
                    </Card>
                </div>
            </Section>
        </PublicLayout>
    );
}
