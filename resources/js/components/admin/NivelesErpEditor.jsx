import { Link2 } from 'lucide-react';
import IconPicker from '@/components/admin/IconPicker';
import FormField from '@/components/ui/FormField';
import Icono from '@/components/ui/Icono';
import Textarea from '@/components/ui/Textarea';
import DatosNivel from '@/components/web/DatosNivel';
import { slug } from '@/lib/utils';

/**
 * Niveles que vienen del ERP (nombre, imagen y números): aquí solo se escribe lo que el ERP no tiene,
 * la descripción de cada nivel y, si el ERP no le puso imagen, un ícono. Se guardan en los mismos
 * elementos de la sección y se unen al nivel por su nombre.
 */
export default function NivelesErpEditor({ niveles, items, onChange }) {
    const delPanel = (nivel) => items.find((item) => slug(item.titulo) === nivel.codigo) ?? {};

    const cambiar = (nivel, cambios) =>
        onChange(
            niveles.map((actual) => {
                const texto = actual.codigo === nivel.codigo ? { ...delPanel(actual), ...cambios } : delPanel(actual);

                return { titulo: actual.nombre, descripcion: texto.descripcion ?? '', icono: texto.icono ?? null };
            }),
        );

    return (
        <div className="flex flex-col gap-4">
            <p className="flex items-start gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary">
                <Link2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Los niveles, su imagen y sus números vienen del ERP y se actualizan solos. Aquí solo escribes la descripción de cada uno.
            </p>

            {niveles.map((nivel, i) => {
                const texto = delPanel(nivel);
                const datos = { titulo: nivel.nombre, financiamientos: nivel.financiamientos_requeridos, porcentajes: nivel.porcentajes };

                return (
                    <div key={nivel.codigo} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-3 flex items-center gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-primary">
                                {nivel.imagen_url ? <img src={nivel.imagen_url} alt="" className="size-full object-cover" /> : <Icono nombre={texto.icono} fallback="Medal" className="size-5" />}
                            </span>
                            <div className="min-w-0">
                                <p className="text-xs font-bold tracking-wide text-gray-400 uppercase">Nivel {i + 1}</p>
                                <h3 className="font-bold text-gray-900">{nivel.nombre}</h3>
                            </div>
                        </div>
                        <DatosNivel nivel={datos} className="mb-3" />
                        <div className="grid gap-3 sm:grid-cols-2">
                            <FormField label="Descripción" htmlFor={`nivel-${nivel.codigo}-descripcion`} className="sm:col-span-2">
                                <Textarea
                                    id={`nivel-${nivel.codigo}-descripcion`}
                                    rows={2}
                                    value={texto.descripcion ?? ''}
                                    onChange={(e) => cambiar(nivel, { descripcion: e.target.value })}
                                    placeholder="Ej. Mejores condiciones y mayor acceso a beneficios conforme mantienes tus pagos al día."
                                />
                            </FormField>
                            {!nivel.imagen_url && (
                                <FormField label="Ícono" htmlFor={`nivel-${nivel.codigo}-icono`} hint="El ERP aún no tiene imagen para este nivel: se usa este ícono.">
                                    <IconPicker id={`nivel-${nivel.codigo}-icono`} value={texto.icono} onChange={(icono) => cambiar(nivel, { icono })} />
                                </FormField>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
