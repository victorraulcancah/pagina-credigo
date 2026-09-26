import { FaWhatsapp } from 'react-icons/fa6';
import { whatsappUrl } from '@/data/site';

/** Botón flotante de WhatsApp (esquina inferior derecha). */
export default function WhatsAppButton({ mensaje }) {
    return (
        <a
            href={whatsappUrl(mensaje)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escríbenos por WhatsApp"
            className="fixed right-4 bottom-4 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/25 transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:outline-none sm:right-6 sm:bottom-6 sm:size-16"
        >
            <FaWhatsapp className="size-7 sm:size-8" aria-hidden="true" />
        </a>
    );
}
