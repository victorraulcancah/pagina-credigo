import { ExternalLink, Save } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';
import PageHeader from '@/components/admin/PageHeader';
import PantallaApi from '@/components/admin/PantallaApi';
import Panel from '@/components/admin/Panel';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import { useFormApi } from '@/hooks/useFormApi';
import { LOGO_POR_DEFECTO } from '@/hooks/useSitio';

/** Vista previa al compartir (Open Graph), Google Analytics y píxel de Meta. */
function SeoFormulario({ ajustes }) {
    const form = useFormApi({
        imagen_compartir: null,
        quitar_imagen_compartir: false,
        analytics_ga4: ajustes.analytics_ga4 ?? '',
        analytics_meta_pixel: ajustes.analytics_meta_pixel ?? '',
    });
    const { data, setData, errors, processing, isDirty } = form;

    const guardar = (e) => {
        e.preventDefault();
        form.put('/admin/configuracion', {
            onSuccess: () => {
                setData((d) => ({ ...d, imagen_compartir: null, quitar_imagen_compartir: false }));
                form.setDefaults({
                    imagen_compartir: null,
                    quitar_imagen_compartir: false,
                    analytics_ga4: data.analytics_ga4,
                    analytics_meta_pixel: data.analytics_meta_pixel,
                });
            },
        });
    };

    // Vista previa de cómo se ve el enlace compartido en WhatsApp
    const imagenNueva = useMemo(() => (data.imagen_compartir ? URL.createObjectURL(data.imagen_compartir) : null), [data.imagen_compartir]);
    useEffect(() => () => imagenNueva && URL.revokeObjectURL(imagenNueva), [imagenNueva]);
    const imagenVista = imagenNueva ?? (data.quitar_imagen_compartir ? null : ajustes.imagen_compartir_url) ?? ajustes.logo_url ?? LOGO_POR_DEFECTO;

    const botonGuardar = (
        <Button type="submit" form="form-seo" variant="secondary" icon={Save} disabled={processing || !isDirty}>
            {processing ? 'Guardando...' : 'Guardar cambios'}
        </Button>
    );

    return (
        <AdminLayout title="SEO y marketing">
            <PageHeader title="SEO y marketing" description="Cómo se ve tu web al compartirla y la medición de visitas y clientes." actions={botonGuardar} />

            <form id="form-seo" onSubmit={guardar} className="grid gap-6 lg:grid-cols-2">
                <Panel
                    title="Imagen para compartir"
                    description="Aparece cuando alguien comparte tu web por WhatsApp o Facebook. Horizontal, 1200×630 px, JPG o PNG, máx. 2 MB. Las páginas con imagen de encabezado usan la suya."
                >
                    <ImageUpload
                        actualUrl={ajustes.imagen_compartir_url}
                        archivo={data.imagen_compartir}
                        onArchivo={(archivo) => setData('imagen_compartir', archivo)}
                        quitada={data.quitar_imagen_compartir}
                        onQuitar={(valor) => setData('quitar_imagen_compartir', valor)}
                        error={errors.imagen_compartir}
                        aspect="aspect-[1200/630]"
                        hint={!ajustes.imagen_compartir_url ? 'Mientras no subas una, se usa el logo.' : undefined}
                    />
                </Panel>

                <Panel title="Vista previa en WhatsApp">
                    <div className="max-w-sm overflow-hidden rounded-xl bg-[#d9fdd3] p-1.5 shadow-sm">
                        <div className="overflow-hidden rounded-lg bg-white/70">
                            <img src={imagenVista} alt="" className="aspect-[1200/630] w-full bg-primary object-cover" />
                            <div className="p-3">
                                <p className="text-sm font-semibold text-gray-900">{ajustes.empresa_nombre}</p>
                                <p className="line-clamp-2 text-xs text-gray-600">{ajustes.empresa_descripcion}</p>
                                <p className="mt-1 text-xs text-gray-400">{window.location.host}</p>
                            </div>
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                        La descripción es la de Empresa y contacto. WhatsApp guarda la vista previa un tiempo: los cambios pueden tardar en verse.
                    </p>
                </Panel>

                <Panel title="Google Analytics 4" description="Cuenta visitas, páginas vistas y solicitudes enviadas.">
                    <FormField
                        label="ID de medición"
                        htmlFor="analytics_ga4"
                        error={errors.analytics_ga4}
                        hint="En Google Analytics: Administrar → Flujos de datos → tu web. Empieza con G-"
                    >
                        <Input id="analytics_ga4" value={data.analytics_ga4} onChange={(e) => setData('analytics_ga4', e.target.value)} error={errors.analytics_ga4} placeholder="G-XXXXXXXXXX" />
                    </FormField>
                </Panel>

                <Panel title="Píxel de Meta" description="Para medir anuncios de Facebook e Instagram (visitas y clientes que envían solicitudes).">
                    <FormField
                        label="ID del píxel"
                        htmlFor="analytics_meta_pixel"
                        error={errors.analytics_meta_pixel}
                        hint="En Meta Business: Administrador de eventos → Orígenes de datos. Solo números."
                    >
                        <Input
                            id="analytics_meta_pixel"
                            inputMode="numeric"
                            value={data.analytics_meta_pixel}
                            onChange={(e) => setData('analytics_meta_pixel', e.target.value)}
                            error={errors.analytics_meta_pixel}
                            placeholder="123456789012345"
                        />
                    </FormField>
                </Panel>

                <Panel title="Google" className="lg:col-span-2">
                    <p className="text-sm text-gray-600">
                        El mapa del sitio se genera solo. Regístralo en Google Search Console para que Google encuentre tus páginas.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button href="/sitemap.xml" nativo newTab variant="ghost" size="sm" icon={ExternalLink} className="border border-gray-200">
                            Ver sitemap.xml
                        </Button>
                        <Button href="https://search.google.com/search-console" newTab variant="ghost" size="sm" icon={ExternalLink} className="border border-gray-200">
                            Abrir Search Console
                        </Button>
                    </div>
                </Panel>

                <div className="flex justify-end lg:col-span-2">{botonGuardar}</div>
            </form>
        </AdminLayout>
    );
}

/** Vista previa al compartir y analítica: los ajustes llegan de la API (GET /api/admin/configuracion). */
export default function Seo() {
    return (
        <PantallaApi url="/admin/configuracion" titulo="SEO y marketing">
            {({ datos }) => <SeoFormulario ajustes={datos} />}
        </PantallaApi>
    );
}
