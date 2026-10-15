import Input from '@/components/ui/Input';

/**
 * Selector de color + campo hexadecimal sincronizados.
 * `porDefecto`: color que se ve en el selector mientras el campo está vacío (ej. el blanco
 * de un encabezado); `placeholder` lo explica en el campo.
 */
export default function ColorInput({ id, value, onChange, error, porDefecto = '#000000', placeholder }) {
    const valido = /^#[0-9a-fA-F]{6}$/.test(value);

    return (
        <div className="flex items-center gap-3">
            <input
                type="color"
                aria-label="Elegir color"
                value={valido ? value : porDefecto}
                onChange={(e) => onChange(e.target.value)}
                className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-gray-300 bg-white p-1 sm:h-12"
            />
            <Input
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                error={error}
                maxLength={7}
                placeholder={placeholder}
                className="font-mono uppercase placeholder:font-sans placeholder:normal-case"
            />
        </div>
    );
}
