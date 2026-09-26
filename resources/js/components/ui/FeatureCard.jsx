import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

/**
 * Tarjeta con ícono, título y descripción (servicios, beneficios, valores).
 * `icon` recibe un componente de lucide-react: icon={Car}
 */
export default function FeatureCard({ icon: Icon, title, description, className, children }) {
    return (
        <Card hover className={cn('flex h-full flex-col', className)}>
            {Icon && (
                <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-accent text-primary sm:size-14">
                    <Icon className="size-6 sm:size-7" aria-hidden="true" />
                </div>
            )}
            <h3 className="text-lg font-bold text-primary sm:text-xl">{title}</h3>
            {description && <p className="mt-2 text-sm text-primary-700/80 sm:text-base">{description}</p>}
            {children && <div className="mt-auto pt-5">{children}</div>}
        </Card>
    );
}
