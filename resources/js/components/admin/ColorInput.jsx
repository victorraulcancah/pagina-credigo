import Input from '@/components/ui/Input';

/** Selector de color + campo hexadecimal sincronizados. */
export default function ColorInput({ id, value, onChange, error }) {
    const valido = /^#[0-9a-fA-F]{6}$/.test(value);

    return (
        <div className="flex items-center gap-3">
            <input
                type="color"
                aria-label="Elegir color"
                value={valido ? value : '#000000'}
                onChange={(e) => onChange(e.target.value)}
                className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-gray-300 bg-white p-1 sm:h-12"
            />
            <Input
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                error={error}
                maxLength={7}
                className="font-mono uppercase"
            />
        </div>
    );
}
