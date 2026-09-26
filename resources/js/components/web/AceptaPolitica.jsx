import Checkbox from '@/components/ui/Checkbox';

/** Consentimiento de tratamiento de datos (Ley N° 29733) para los formularios públicos. */
export default function AceptaPolitica({ checked, onChange, error, className }) {
    return (
        <Checkbox id="acepta_politica" checked={checked} onChange={onChange} error={error} className={className}>
            He leído y acepto la{' '}
            <a href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-2">
                política de privacidad
            </a>{' '}
            y el tratamiento de mis datos personales.
        </Checkbox>
    );
}
