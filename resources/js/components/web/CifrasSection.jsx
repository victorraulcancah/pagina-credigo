import Revelar from '@/components/ui/Revelar';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Stat from '@/components/ui/Stat';
import { cn, columnasLg } from '@/lib/utils';

/** Cifras destacadas sobre fondo azul (items: titulo = valor, descripcion = etiqueta). */
export default function CifrasSection({ seccion }) {
    const cifras = seccion?.items ?? [];
    if (!cifras.length) return null;

    return (
        <Section background="dark">
            <Revelar>
                <SectionHeading light eyebrow={seccion.subtitulo} title={seccion.titulo} description={seccion.contenido} />
            </Revelar>
            <div className={cn('mt-12 grid grid-cols-2 gap-x-6 gap-y-10', columnasLg(cifras.length))}>
                {cifras.map((cifra, i) => (
                    <Revelar key={i} desde="zoom" retraso={i * 120}>
                        <Stat light value={cifra.titulo} label={cifra.descripcion} />
                    </Revelar>
                ))}
            </div>
        </Section>
    );
}
