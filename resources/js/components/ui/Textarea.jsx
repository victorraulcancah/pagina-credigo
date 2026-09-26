import { fieldClasses } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

export default function Textarea({ error, className, rows = 5, ...props }) {
    return (
        <textarea
            rows={rows}
            aria-invalid={error ? true : undefined}
            className={cn(fieldClasses(error), 'resize-y py-3', className)}
            {...props}
        />
    );
}
