import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

/**
 * Encabezado de sección: etiqueta + título + descripción.
 * Usar `light` cuando la sección tenga fondo azul (background="dark").
 */
export default function SectionHeading({
    eyebrow,
    title,
    description,
    align = 'center',
    light = false,
    as: Tag = 'h2',
    className,
}) {
    if (!eyebrow && !title && !description) return null;

    return (
        <div
            className={cn(
                'max-w-3xl',
                align === 'center' ? 'mx-auto text-center' : 'text-left',
                className,
            )}
        >
            {eyebrow && <Badge className="mb-4">{eyebrow}</Badge>}
            {title && (
                <Tag
                    className={cn(
                        'text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl',
                        light ? 'text-white' : 'text-primary',
                    )}
                >
                    {title}
                </Tag>
            )}
            {description && (
                <p
                    className={cn(
                        'mt-4 text-base text-pretty whitespace-pre-line sm:text-lg',
                        light ? 'text-primary-100' : 'text-primary-700/80',
                    )}
                >
                    {description}
                </p>
            )}
        </div>
    );
}
