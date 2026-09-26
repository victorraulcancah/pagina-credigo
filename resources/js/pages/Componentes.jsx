import { ArrowRight, Car, HandCoins, Send, ShieldCheck, Smartphone, Users } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FeatureCard from '@/components/ui/FeatureCard';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Select from '@/components/ui/Select';
import Stat from '@/components/ui/Stat';
import Textarea from '@/components/ui/Textarea';

/** Guía visual de componentes (solo en entorno local: /componentes). */
export default function Componentes() {
    return (
        <PublicLayout title="Componentes">
            <PageHero
                eyebrow="Guía de componentes"
                title="Componentes reutilizables de CrediGo"
                description="Vista previa de todos los bloques de la web con los colores de marca: amarillo #f8ec34 y azul profundo #0f1037."
            >
                <Button href="/" icon={ArrowRight} iconPosition="right">
                    Botón primario
                </Button>
                <Button variant="outline-light">Botón contorno claro</Button>
            </PageHero>

            <Section>
                <SectionHeading eyebrow="Button" title="Botones" description="Variantes y tamaños." />
                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                    <Button>Primario</Button>
                    <Button variant="secondary">Secundario</Button>
                    <Button variant="outline">Contorno</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button disabled>Deshabilitado</Button>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Button size="sm">Pequeño</Button>
                    <Button size="md">Mediano</Button>
                    <Button size="lg" icon={ArrowRight} iconPosition="right">
                        Grande
                    </Button>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Badge>Accent</Badge>
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="soft">Soft</Badge>
                    <Badge variant="outline">Outline</Badge>
                </div>
            </Section>

            <Section background="muted">
                <SectionHeading
                    eyebrow="FeatureCard"
                    title="Tarjetas de servicios"
                    description="Grilla responsiva: 1 columna en celular, 2 en tablet y 3 en escritorio."
                />
                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <FeatureCard
                        icon={Car}
                        title="Financiamiento vehicular"
                        description="Accede a tu auto o moto con cuotas semanales."
                    >
                        <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
                            Ver más
                        </Button>
                    </FeatureCard>
                    <FeatureCard
                        icon={Smartphone}
                        title="Celulares"
                        description="Financia tu celular para trabajar con aplicativos."
                    />
                    <FeatureCard
                        icon={ShieldCheck}
                        title="Respaldo"
                        description="Contratos claros y acompañamiento en todo el proceso."
                    />
                </div>
            </Section>

            <Section background="dark">
                <SectionHeading
                    light
                    eyebrow="Stat"
                    title="Cifras destacadas"
                    description="Sección con fondo azul profundo."
                />
                <div className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
                    <Stat light value="+650" label="Conductores" />
                    <Stat light value="+600" label="Financiamientos" />
                    <Stat light value="2" label="Ciudades" />
                    <Stat light value="2" label="Plataformas aliadas" />
                </div>
            </Section>

            <Section>
                <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
                    <SectionHeading
                        align="left"
                        eyebrow="Formulario"
                        title="Campos de formulario"
                        description="Input, Select y Textarea dentro de FormField, con estado de error."
                    />
                    <Card>
                        <form className="grid gap-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
                            <FormField label="Nombre" htmlFor="demo-nombre" required>
                                <Input id="demo-nombre" placeholder="Tu nombre" />
                            </FormField>
                            <FormField label="Celular" htmlFor="demo-celular" error="Ingresa un celular válido">
                                <Input id="demo-celular" type="tel" placeholder="999 999 999" error />
                            </FormField>
                            <FormField label="Servicio" htmlFor="demo-servicio" className="sm:col-span-2">
                                <Select
                                    id="demo-servicio"
                                    placeholder="Elige un servicio"
                                    options={[
                                        { value: 'vehicular', label: 'Financiamiento vehicular' },
                                        { value: 'celular', label: 'Celulares' },
                                    ]}
                                />
                            </FormField>
                            <FormField
                                label="Mensaje"
                                htmlFor="demo-mensaje"
                                hint="Cuéntanos qué necesitas"
                                className="sm:col-span-2"
                            >
                                <Textarea id="demo-mensaje" placeholder="Escribe tu mensaje" />
                            </FormField>
                            <Button type="submit" variant="secondary" icon={Send} fullWidth className="sm:col-span-2">
                                Enviar
                            </Button>
                        </form>
                    </Card>
                </div>
            </Section>

            <Section background="accent">
                <div className="flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left">
                    <div className="flex items-center gap-4">
                        <div className="hidden size-14 items-center justify-center rounded-2xl bg-primary text-accent sm:flex">
                            <HandCoins className="size-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold sm:text-3xl">Sección amarilla (CTA)</h2>
                            <p className="mt-1 text-primary-800">Ideal para llamadas a la acción.</p>
                        </div>
                    </div>
                    <Button variant="secondary" size="lg" icon={Users}>
                        Únete a CrediGo
                    </Button>
                </div>
            </Section>
        </PublicLayout>
    );
}
