import { usePage } from '@inertiajs/react';
import { LogIn, MessageCircle } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import { empresa } from '@/data/site';

export default function Welcome() {
    const { props } = usePage();

    return (
        <PublicLayout title="Inicio" description={empresa.descripcion}>
            <PageHero align="center" eyebrow={empresa.eslogan} title="CrediGo" description={empresa.descripcion}>
                <Button href="/contacto" size="lg" icon={MessageCircle}>
                    Contáctanos
                </Button>
                <Button href={props.erpUrl} variant="outline-light" size="lg" icon={LogIn}>
                    Acceso al sistema
                </Button>
            </PageHero>
        </PublicLayout>
    );
}
