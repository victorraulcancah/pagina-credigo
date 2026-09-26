import { ChevronDown } from 'lucide-react';
import { fieldClasses } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

/**
 * Lista desplegable.
 * <Select options={[{ value: 'auto', label: 'Auto' }]} placeholder="Elige un servicio" />
 */
export default function Select({ options = [], placeholder, error, className, ...props }) {
    return (
        <div className="relative">
            <select
                aria-invalid={error ? true : undefined}
                className={cn(fieldClasses(error), 'h-11 cursor-pointer appearance-none pr-10 sm:h-12', className)}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown
                className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-primary-400"
                aria-hidden="true"
            />
        </div>
    );
}
