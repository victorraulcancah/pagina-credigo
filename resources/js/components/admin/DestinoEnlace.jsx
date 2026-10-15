import { CalendarCheck, FileText, Link2, Phone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { PAGINAS } from '@/data/paginas';
import { useConsulta } from '@/hooks/useConsulta';
import { useSitio } from '@/hooks/useSitio';
import { cn } from '@/lib/utils';

const TIPOS = [
    { valor: 'pagina', label: 'Página del sitio', icono: FileText },
    { valor: 'reservar', label: 'Reservar', icono: CalendarCheck },
    { valor: 'whatsapp', label: 'WhatsApp', icono: FaWhatsapp },
    { valor: 'telefono', label: 'Llamar', icono: Phone },
    { valor: 'enlace', label: 'Otro enlace', icono: Link2 },
];

// Páginas del sitio que se pueden elegir (Reservar tiene su propia opción)
const PAGINAS_SITIO = [
    ...Object.values(PAGINAS).filter((pagina) => pagina.url && pagina.url !== '/reservar'),
    { label: 'Libro de reclamaciones', url: '/libro-de-reclamaciones' },
];

const parametro = (valor, clave) => new URLSearchParams(valor.split('?')[1] ?? '').get(clave) ?? '';

/** Enlace guardado → qué es y sus datos (para mostrarlo en el selector). */
export function leerDestino(valor = '') {
    if (/^\/reservar(\?|$)/.test(valor)) return { tipo: 'reservar', reserva: parametro(valor, 'tipo') };
    if (/^\/whatsapp(\?|$)/.test(valor)) return { tipo: 'whatsapp', texto: parametro(valor, 'texto') };
    if (valor.startsWith('tel:')) return { tipo: 'telefono', telefono: valor.slice(4) };
    if (!valor || PAGINAS_SITIO.some((pagina) => pagina.url === valor)) return { tipo: 'pagina', pagina: valor };
    return { tipo: 'enlace', enlace: valor };
}

/** Los datos del enlace para el tipo elegido (vacíos si el enlace es de otro tipo). */
function datosPara(tipo, valor) {
    if (tipo === 'pagina') return { pagina: PAGINAS_SITIO.some((p) => p.url === valor) ? valor : '' };
    if (tipo === 'reservar') return { reserva: valor.startsWith('/reservar') ? parametro(valor, 'tipo') : '' };
    if (tipo === 'whatsapp') return { texto: valor.startsWith('/whatsapp') ? parametro(valor, 'texto') : '' };
    if (tipo === 'telefono') return { telefono: valor.startsWith('tel:') ? valor.slice(4) : '' };
    return { enlace: valor };
}

const armar = {
    pagina: (pagina) => pagina,
    reservar: (slug) => (slug ? `/reservar?tipo=${encodeURIComponent(slug)}` : '/reservar'),
    // El servidor (/whatsapp) lo lleva al número de la empresa: si cambia el número, el botón sigue funcionando
    whatsapp: (texto) => (texto ? `/whatsapp?texto=${encodeURIComponent(texto)}` : '/whatsapp'),
    telefono: (numero) => {
        const limpio = numero.replace(/[^\d+]/g, '');
        return limpio ? `tel:${limpio}` : '';
    },
    enlace: (enlace) => enlace,
};

/** "/whatsapp?texto=Hola" → "WhatsApp: “Hola”" (para las listas del panel). */
export function describirDestino(valor = '') {
    const destino = leerDestino(valor);
    if (destino.tipo === 'reservar') return destino.reserva ? `Reservar (${destino.reserva})` : 'Reservar';
    if (destino.tipo === 'whatsapp') return destino.texto ? `WhatsApp: “${destino.texto}”` : 'WhatsApp';
    if (destino.tipo === 'telefono') return `Llamar al ${destino.telefono}`;
    return PAGINAS_SITIO.find((p) => p.url === valor)?.label ?? valor;
}

/** Lista de tipos de reserva (solo se pide si se elige "Reservar"). */
function TipoDeReserva({ id, value, onChange }) {
    const { datos: tipos = [] } = useConsulta('/admin/reservas/tipos');

    return (
        <Select
            id={id}
            aria-label="Qué se reserva"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            options={[
                { value: '', label: 'Que el cliente elija (todos los tipos)' },
                ...tipos.map((tipo) => ({ value: tipo.slug, label: `${tipo.nombre}${tipo.activo ? '' : ' (oculto)'}` })),
            ]}
        />
    );
}

/**
 * A dónde lleva un botón, sin escribir enlaces: una página del sitio, el formulario de reserva
 * (con el tipo ya elegido), WhatsApp con un mensaje ya escrito, llamar por teléfono u otro enlace.
 * Guarda un enlace normal (value / onChange), el mismo que valida el servidor (EnlaceRegla).
 */
export default function DestinoEnlace({ id, label = 'A dónde lleva', value = '', onChange, error, className }) {
    const sitio = useSitio();
    // El tipo elegido se recuerda aunque aún no tenga datos (ej. "Llamar" sin número)
    const [tipo, setTipo] = useState(() => leerDestino(value ?? '').tipo);
    const emitido = useRef(value);
    const datos = datosPara(tipo, value ?? '');

    const cambiar = (nuevo) => {
        emitido.current = nuevo;
        onChange(nuevo);
    };

    // Si el enlace cambia desde afuera (otro registro), se marca su tipo; lo que escribe aquí no lo cambia
    useEffect(() => {
        if (value && value !== emitido.current) setTipo(leerDestino(value).tipo);
        emitido.current = value;
    }, [value]);

    const elegir = (nuevo) => {
        if (nuevo === tipo) return;
        setTipo(nuevo);
        const inicial = {
            pagina: '',
            reservar: armar.reservar(''),
            whatsapp: armar.whatsapp(''),
            telefono: armar.telefono(sitio.contacto_telefono ?? ''),
            enlace: '',
        };
        cambiar(inicial[nuevo]);
    };

    const pagina = PAGINAS_SITIO.find((p) => p.url === datos.pagina);
    const resumen = {
        pagina: pagina ? `Lleva a la página ${pagina.label}.` : 'Elige la página.',
        reservar: 'Abre el formulario de reserva. La reserva llega al panel (Reservas) y el cliente la envía por WhatsApp.',
        whatsapp: sitio.contacto_whatsapp
            ? 'Abre el WhatsApp de la empresa con este mensaje ya escrito.'
            : 'Falta el número de WhatsApp en Empresa y contacto: mientras tanto lleva a Soporte.',
        telefono: 'Al tocarlo en el celular, llama a ese número.',
        enlace: 'Una dirección que empiece con https://, / (página del sitio) o # (sección).',
    }[tipo];

    return (
        <fieldset className={className}>
            <legend className="mb-1.5 text-sm font-semibold text-primary">{label}</legend>
            <div className="flex flex-wrap gap-1.5">
                {TIPOS.map((opcion) => {
                    const activo = opcion.valor === tipo;
                    return (
                        <button
                            key={opcion.valor}
                            type="button"
                            onClick={() => elegir(opcion.valor)}
                            aria-pressed={activo}
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition',
                                activo ? 'bg-primary text-white shadow-sm' : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:text-primary hover:ring-primary-300',
                            )}
                        >
                            <opcion.icono className="size-3.5 shrink-0" aria-hidden="true" />
                            {opcion.label}
                        </button>
                    );
                })}
            </div>

            <div className="mt-2.5">
                {tipo === 'pagina' && (
                    <Select
                        id={id}
                        aria-label="Página"
                        value={datos.pagina ?? ''}
                        onChange={(e) => cambiar(armar.pagina(e.target.value))}
                        placeholder="Elige una página"
                        error={error}
                        options={PAGINAS_SITIO.map((p) => ({ value: p.url, label: p.label }))}
                    />
                )}
                {tipo === 'reservar' && <TipoDeReserva id={id} value={datos.reserva ?? ''} onChange={(slug) => cambiar(armar.reservar(slug))} />}
                {tipo === 'whatsapp' && (
                    <Textarea
                        id={id}
                        rows={2}
                        maxLength={300}
                        value={datos.texto ?? ''}
                        onChange={(e) => cambiar(armar.whatsapp(e.target.value))}
                        error={error}
                        placeholder="Hola, quiero reservar un viaje"
                    />
                )}
                {tipo === 'telefono' && (
                    <Input
                        id={id}
                        type="tel"
                        inputMode="tel"
                        value={datos.telefono ?? ''}
                        onChange={(e) => cambiar(armar.telefono(e.target.value))}
                        error={error}
                        placeholder="+51 987 654 321"
                    />
                )}
                {tipo === 'enlace' && (
                    <Input id={id} value={datos.enlace ?? ''} onChange={(e) => cambiar(armar.enlace(e.target.value))} error={error} placeholder="https://… o /#como-funciona" />
                )}
            </div>

            {error ? (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {error}
                </p>
            ) : (
                <p className="mt-1.5 text-sm text-primary-400">{resumen}</p>
            )}
        </fieldset>
    );
}
