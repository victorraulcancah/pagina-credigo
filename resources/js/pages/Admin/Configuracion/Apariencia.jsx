import { LogIn, RotateCcw, Save, TriangleAlert } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import ColorInput from '@/components/admin/ColorInput';
import ImageUpload from '@/components/admin/ImageUpload';
import PageHeader from '@/components/admin/PageHeader';
import Panel from '@/components/admin/Panel';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { useFormApi } from '@/hooks/useFormApi';
import { LOGO_POR_DEFECTO } from '@/hooks/useSitio';

/** Contraste WCAG entre dos colores hex (1 a 21). */
function contraste(a, b) {
    const luminancia = (hex) => {
        const [r, g, bl] = [1, 3, 5].map((i) => {
            const c = parseInt(hex.slice(i, i + 2), 16) / 255;
            return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
    };
    const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
}

const esHex = (valor) => /^#[0-9a-fA-F]{6}$/.test(valor);

export default function Apariencia({ ajustes, coloresPorDefecto }) {
    const form = useFormApi({
        color_primario: ajustes.color_primario,
        color_acento: ajustes.color_acento,
        logo: null,
        quitar_logo: false,
        favicon: null,
        quitar_favicon: false,
    });
    const { data, setData, processing, errors, isDirty } = form;

    const coloresValidos = esHex(data.color_primario) && esHex(data.color_acento);
    const avisos = coloresValidos
        ? [
              contraste(data.color_primario, '#ffffff') < 4.5 && 'El color principal es muy claro: el texto blanco encima no se leerá bien.',
              contraste(data.color_primario, data.color_acento) < 3 && 'El amarillo y el azul se parecen mucho: los botones no resaltarán.',
          ].filter(Boolean)
        : [];

    const guardar = (e) => {
        e.preventDefault();
        form.put('/admin/configuracion', {
            onSuccess: () => {
                const archivosLimpios = { logo: null, quitar_logo: false, favicon: null, quitar_favicon: false };
                setData((d) => ({ ...d, ...archivosLimpios }));
                form.setDefaults({ color_primario: data.color_primario, color_acento: data.color_acento, ...archivosLimpios });
            },
        });
    };

    const logoNuevo = useMemo(() => (data.logo ? URL.createObjectURL(data.logo) : null), [data.logo]);
    useEffect(() => () => logoNuevo && URL.revokeObjectURL(logoNuevo), [logoNuevo]);
    const logoVista = logoNuevo ?? (data.quitar_logo ? LOGO_POR_DEFECTO : ajustes.logo_url || LOGO_POR_DEFECTO);

    const botonGuardar = (
        <Button type="submit" form="form-apariencia" variant="secondary" icon={Save} disabled={processing || !isDirty}>
            {processing ? 'Guardando...' : 'Guardar cambios'}
        </Button>
    );

    return (
        <AdminLayout title="Apariencia">
            <PageHeader
                title="Apariencia"
                description="Colores de marca, logo y favicon. Los cambios se aplican en todo el sitio al guardar."
                actions={botonGuardar}
            />

            <form id="form-apariencia" onSubmit={guardar} className="grid gap-6 lg:grid-cols-2">
                <Panel title="Colores de marca">
                    <div className="flex flex-col gap-5">
                        <FormField label="Color principal (fondos, textos)" htmlFor="color_primario" error={errors.color_primario}>
                            <ColorInput id="color_primario" value={data.color_primario} onChange={(v) => setData('color_primario', v)} error={errors.color_primario} />
                        </FormField>
                        <FormField label="Color de acento (botones, resaltados)" htmlFor="color_acento" error={errors.color_acento}>
                            <ColorInput id="color_acento" value={data.color_acento} onChange={(v) => setData('color_acento', v)} error={errors.color_acento} />
                        </FormField>

                        {avisos.map((aviso) => (
                            <p key={aviso} className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                                <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {aviso}
                            </p>
                        ))}

                        <button
                            type="button"
                            onClick={() => setData((d) => ({ ...d, ...coloresPorDefecto }))}
                            className="inline-flex items-center gap-2 self-start text-sm font-medium text-gray-600 hover:text-primary"
                        >
                            <RotateCcw className="size-4" aria-hidden="true" /> Restablecer colores originales
                        </button>
                    </div>
                </Panel>

                <Panel title="Vista previa">
                    {/* Variables locales: la vista previa usa los colores elegidos sin afectar el panel */}
                    <div
                        style={coloresValidos ? { '--color-primary': data.color_primario, '--color-accent': data.color_acento } : undefined}
                        className="overflow-hidden rounded-2xl ring-1 ring-gray-200"
                    >
                        <div className="flex items-center justify-between gap-3 bg-primary px-4 py-2.5">
                            <img src={logoVista} alt="" className="h-8 w-auto object-contain" />
                            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-accent px-3 py-1 text-xs font-semibold text-white">
                                <LogIn className="size-3.5" /> Acceso al sistema
                            </span>
                        </div>
                        <div className="bg-primary px-4 pt-6 pb-8 text-white">
                            <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase">Eslogan</span>
                            <p className="mt-3 text-xl font-extrabold">Título del banner</p>
                            <p className="mt-1 text-sm text-primary-100">Así se verá el texto sobre el color principal.</p>
                            <span className="mt-4 inline-block rounded-full bg-accent px-4 py-2 text-sm font-semibold text-primary">Botón principal</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 bg-primary-50 p-4">
                            {['Servicio', 'Servicio'].map((t, i) => (
                                <div key={i} className="rounded-xl bg-white p-3 ring-1 ring-primary-100">
                                    <span className="mb-2 block size-7 rounded-lg bg-accent" />
                                    <p className="text-sm font-bold text-primary">{t}</p>
                                    <p className="text-xs text-primary-700/80">Texto de ejemplo</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Panel>

                <Panel title="Logo" description="Se usa en el menú, el pie de página y el login. PNG con fondo transparente o WEBP, máx. 2 MB.">
                    <ImageUpload
                        actualUrl={ajustes.logo_url}
                        archivo={data.logo}
                        onArchivo={(archivo) => setData('logo', archivo)}
                        quitada={data.quitar_logo}
                        onQuitar={(valor) => setData('quitar_logo', valor)}
                        error={errors.logo}
                        hint={!ajustes.logo_url ? 'Ahora se usa el logo por defecto de CrediGo.' : undefined}
                        aspect="aspect-[3/1]"
                        fondo="bg-primary"
                    />
                </Panel>

                <Panel title="Favicon" description="Ícono de la pestaña del navegador. Cuadrado (ej. 512×512), PNG o ICO, máx. 512 KB.">
                    <div className="max-w-40">
                        <ImageUpload
                            actualUrl={ajustes.favicon_url}
                            archivo={data.favicon}
                            onArchivo={(archivo) => setData('favicon', archivo)}
                            quitada={data.quitar_favicon}
                            onQuitar={(valor) => setData('quitar_favicon', valor)}
                            error={errors.favicon}
                            aspect="aspect-square"
                            accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/webp,.ico"
                        />
                    </div>
                </Panel>

                <div className="flex justify-end lg:col-span-2">{botonGuardar}</div>
            </form>
        </AdminLayout>
    );
}
