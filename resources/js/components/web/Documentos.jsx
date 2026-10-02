import { Download, FileText } from 'lucide-react';
import Revelar, { escalonar } from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import { formatoTamano } from '@/lib/archivos';
import { cn } from '@/lib/utils';

/**
 * PDFs para descargar (se suben en el panel → Documentos), como lista con líneas:
 * qué es, para qué sirve y cuánto pesa (importa con datos móviles). Se abren en otra pestaña.
 * `claro`: sobre fondo azul.
 */
export default function Documentos({ documentos = [], claro = false, className }) {
    if (!documentos.length) return null;

    return (
        <ul className={cn('divide-y border-y', claro ? 'divide-white/15 border-white/15' : 'divide-primary-100 border-primary-100', className)}>
            {documentos.map((documento, i) => (
                <Revelar as="li" key={documento.id} retraso={escalonar(i, 80)}>
                    <a href={documento.archivo_url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 py-5 sm:gap-5">
                        <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl', claro ? 'bg-accent text-primary' : 'bg-primary text-accent')}>
                            <FileText className="size-6" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block font-bold text-pretty group-hover:underline">{documento.titulo}</span>
                            {documento.descripcion && (
                                <span className={cn('mt-0.5 block text-sm', claro ? 'text-white/70' : 'text-primary-700/80')}>{documento.descripcion}</span>
                            )}
                            <span className={cn('mt-1 block text-xs font-semibold tabular-nums', claro ? 'text-white/60' : 'text-primary-500')}>
                                PDF · {formatoTamano(documento.tamano)}
                            </span>
                        </span>
                        <span
                            className={cn(
                                'flex shrink-0 items-center gap-2 rounded-full text-sm font-semibold transition sm:px-4 sm:py-2',
                                claro ? 'sm:ring-1 sm:ring-white/30 sm:group-hover:bg-white sm:group-hover:text-primary' : 'sm:ring-1 sm:ring-primary-200 sm:group-hover:bg-primary sm:group-hover:text-white',
                            )}
                        >
                            <Download className="size-5 sm:size-4" aria-hidden="true" />
                            <span className="hidden sm:inline">Descargar</span>
                        </span>
                    </a>
                </Revelar>
            ))}
        </ul>
    );
}

/** Bloque de página con los PDFs de una categoría. Sin documentos no se muestra. */
export function DocumentosSection({ documentos = [], titulo = 'Documentos para descargar', descripcion, background = 'white' }) {
    if (!documentos.length) return null;

    return (
        <Section id="documentos" background={background}>
            <Revelar>
                <SectionHeading align="left" title={titulo} description={descripcion} light={background === 'dark'} />
            </Revelar>
            <Documentos documentos={documentos} claro={background === 'dark'} className="mt-10" />
        </Section>
    );
}

/** Documentos dentro de otra sección, debajo de su contenido y con su propio subtítulo. Sin documentos no se muestra. */
export function DocumentosBloque({ documentos = [], titulo = 'Documentos para descargar', claro = false, className }) {
    if (!documentos.length) return null;

    return (
        <div className={cn('mt-16 text-left', className)}>
            <h3 className={cn('text-xl font-bold tracking-tight sm:text-2xl', claro ? 'text-white' : 'text-primary')}>{titulo}</h3>
            <Documentos documentos={documentos} claro={claro} className="mt-6" />
        </div>
    );
}
