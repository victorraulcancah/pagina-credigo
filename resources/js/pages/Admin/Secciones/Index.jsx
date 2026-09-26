import { Link } from '@inertiajs/react';
import { ChevronRight, ExternalLink } from 'lucide-react';
import EstadoBadge from '@/components/admin/EstadoBadge';
import PageHeader from '@/components/admin/PageHeader';
import AdminLayout from '@/components/layout/AdminLayout';
import { PAGINAS } from '@/data/paginas';

export default function SeccionesIndex({ secciones }) {
    const grupos = Object.keys(PAGINAS)
        .map((pagina) => ({ pagina, ...PAGINAS[pagina], secciones: secciones.filter((s) => s.pagina === pagina) }))
        .filter((grupo) => grupo.secciones.length > 0);

    return (
        <AdminLayout title="Secciones">
            <PageHeader title="Secciones" description="Textos, imágenes y listas de cada página del sitio." />

            <div className="flex flex-col gap-8">
                {grupos.map((grupo) => (
                    <section key={grupo.pagina}>
                        <div className="mb-3 flex items-baseline justify-between gap-3">
                            <h2 className="text-lg font-bold text-gray-900">
                                {grupo.label}
                                {grupo.descripcion && <span className="ml-2 text-sm font-normal text-gray-500">{grupo.descripcion}</span>}
                            </h2>
                            {grupo.url && (
                                <a
                                    href={grupo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-gray-500 hover:text-primary"
                                >
                                    Ver página <ExternalLink className="size-3.5" aria-hidden="true" />
                                </a>
                            )}
                        </div>
                        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
                            {grupo.secciones.map((seccion) => (
                                <li key={seccion.id}>
                                    <Link
                                        href={`/admin/secciones/${seccion.id}/edit`}
                                        className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-gray-50 sm:px-5"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-gray-900">{seccion.nombre.replace(/^.*·\s*/, '')}</p>
                                            {seccion.titulo && <p className="truncate text-sm text-gray-500">{seccion.titulo}</p>}
                                        </div>
                                        <EstadoBadge activo={seccion.activo} className="hidden sm:inline-flex" />
                                        <ChevronRight className="size-5 shrink-0 text-gray-400" aria-hidden="true" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </AdminLayout>
    );
}
