import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

const variants = {
    primary: 'bg-accent text-primary hover:bg-accent-300 focus-visible:ring-accent',
    secondary: 'bg-primary text-white hover:bg-primary-700 focus-visible:ring-primary',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus-visible:ring-primary',
    'outline-light': 'border-2 border-white/70 text-white hover:bg-white hover:text-primary focus-visible:ring-white',
    'outline-accent': 'border-2 border-accent text-white hover:bg-accent hover:text-primary focus-visible:ring-accent',
    ghost: 'text-primary hover:bg-primary-50 focus-visible:ring-primary',
};

const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-6 text-sm sm:text-base',
    lg: 'h-12 px-7 text-base sm:h-14 sm:px-8 sm:text-lg',
};

const isExternalHref = (href) => /^(https?:|mailto:|tel:)/.test(href);

/**
 * Botón de la web. Con `href` se renderiza como enlace:
 * rutas internas usan <Link> de Inertia; http/mailto/tel usan <a>.
 *
 * <Button href="/contacto" icon={ArrowRight} iconPosition="right">Contáctanos</Button>
 * <Button variant="secondary" type="submit" fullWidth>Enviar</Button>
 */
export default function Button({
    href,
    newTab = false,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    className,
    children,
    ...props
}) {
    const classes = cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap',
        'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
    );

    const icon = Icon ? <Icon className="size-4 shrink-0 sm:size-5" aria-hidden="true" /> : null;
    const content = (
        <>
            {iconPosition === 'left' && icon}
            {children}
            {iconPosition === 'right' && icon}
        </>
    );

    if (href && isExternalHref(href)) {
        return (
            <a
                href={href}
                className={classes}
                {...(newTab && { target: '_blank', rel: 'noopener noreferrer' })}
                {...props}
            >
                {content}
            </a>
        );
    }

    if (href) {
        return (
            <Link href={href} className={classes} {...props}>
                {content}
            </Link>
        );
    }

    return (
        <button type="button" className={classes} {...props}>
            {content}
        </button>
    );
}
