import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import Card from '@/components/ui/Card';
import Section from '@/components/ui/Section';
import ContactoForm from '@/components/web/ContactoForm';
import FaqSection from '@/components/web/FaqSection';
import { useSitio } from '@/hooks/useSitio';

function DatoContacto({ icon: Icon, titulo, href, externo = false, children }) {
    const contenido = (
        <>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
                <span className="block text-xs font-bold tracking-wide text-primary-400 uppercase">{titulo}</span>
                <span className="mt-0.5 block font-semibold break-words text-primary">{children}</span>
            </span>
        </>
    );

    const clases = 'flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-primary-100 transition';

    return href ? (
        <a
            href={href}
            className={`${clases} hover:ring-primary-300`}
            {...(externo && { target: '_blank', rel: 'noopener noreferrer' })}
        >
            {contenido}
        </a>
    ) : (
        <div className={clases}>{contenido}</div>
    );
}

export default function Contacto({ secciones, servicios, preguntas }) {
    const sitio = useSitio();
    const hero = secciones['contacto.hero'];
    const formulario = secciones['contacto.formulario'];
    const whatsapp = sitio.whatsappUrl();

    return (
        <PublicLayout title="Contacto" description={hero?.contenido}>
            <PageHero imagen={hero?.imagen_url} eyebrow={hero?.subtitulo} title={hero?.titulo || 'Contacto'} description={hero?.contenido} />

            <Section background="muted">
                <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
                    <div className="flex flex-col gap-4 lg:col-span-2">
                        {whatsapp && (
                            <DatoContacto icon={FaWhatsapp} titulo="WhatsApp" href={whatsapp} externo>
                                Escríbenos ahora
                            </DatoContacto>
                        )}
                        {sitio.contacto_telefono && (
                            <DatoContacto icon={Phone} titulo="Teléfono" href={`tel:${sitio.contacto_telefono.replace(/\s/g, '')}`}>
                                {sitio.contacto_telefono}
                            </DatoContacto>
                        )}
                        {sitio.contacto_email && (
                            <DatoContacto icon={Mail} titulo="Correo" href={`mailto:${sitio.contacto_email}`}>
                                {sitio.contacto_email}
                            </DatoContacto>
                        )}
                        {(sitio.contacto_direccion || sitio.contacto_ciudad) && (
                            <DatoContacto icon={MapPin} titulo="Dirección">
                                {[sitio.contacto_direccion, sitio.contacto_ciudad].filter(Boolean).join(', ')}
                            </DatoContacto>
                        )}
                        {sitio.contacto_horario && (
                            <DatoContacto icon={Clock} titulo="Horario">
                                {sitio.contacto_horario}
                            </DatoContacto>
                        )}
                    </div>

                    <Card className="lg:col-span-3">
                        {formulario?.titulo && <h2 className="text-2xl font-bold text-primary sm:text-3xl">{formulario.titulo}</h2>}
                        {formulario?.contenido && <p className="mt-2 text-primary-700/80">{formulario.contenido}</p>}
                        <div className="mt-6">
                            <ContactoForm servicios={servicios} />
                        </div>
                    </Card>
                </div>

                {sitio.contacto_mapa_url && (
                    <iframe
                        src={sitio.contacto_mapa_url}
                        title="Ubicación en el mapa"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="mt-10 h-72 w-full rounded-3xl border-0 shadow-sm sm:h-96"
                        allowFullScreen
                    />
                )}
            </Section>

            <FaqSection seccion={secciones['general.faq']} preguntas={preguntas} />
        </PublicLayout>
    );
}
