import { KeyRound, Save } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import PantallaApi from '@/components/admin/PantallaApi';
import Panel from '@/components/admin/Panel';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import { refrescarCompartido } from '@/hooks/useCompartido';
import { useFormApi } from '@/hooks/useFormApi';

function PerfilFormulario({ usuario }) {
    const datos = useFormApi({ name: usuario.name, email: usuario.email });
    const clave = useFormApi({ current_password: '', password: '', password_confirmation: '' });

    const guardarDatos = (e) => {
        e.preventDefault();
        datos.put('/admin/perfil', { recargar: () => refrescarCompartido('/sesion'), onSuccess: () => datos.setDefaults() });
    };

    const guardarClave = (e) => {
        e.preventDefault();
        clave.put('/admin/perfil/password', { recargar: false, onSuccess: () => clave.reset() });
    };

    return (
        <AdminLayout title="Mi perfil">
            <PageHeader title="Mi perfil" description="Tus datos de acceso al panel." />

            <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Datos personales">
                    <form onSubmit={guardarDatos} className="flex flex-col gap-5">
                        <FormField label="Nombre" htmlFor="name" error={datos.errors.name} required>
                            <Input id="name" autoComplete="name" value={datos.data.name} onChange={(e) => datos.setData('name', e.target.value)} error={datos.errors.name} />
                        </FormField>
                        <FormField label="Correo" htmlFor="email" error={datos.errors.email} required>
                            <Input id="email" type="email" autoComplete="email" value={datos.data.email} onChange={(e) => datos.setData('email', e.target.value)} error={datos.errors.email} />
                        </FormField>
                        <Button type="submit" variant="secondary" icon={Save} disabled={datos.processing || !datos.isDirty} className="self-start">
                            Guardar
                        </Button>
                    </form>
                </Panel>

                <Panel title="Cambiar contraseña" description="Mínimo 8 caracteres.">
                    <form onSubmit={guardarClave} className="flex flex-col gap-5">
                        <FormField label="Contraseña actual" htmlFor="current_password" error={clave.errors.current_password} required>
                            <Input id="current_password" type="password" autoComplete="current-password" value={clave.data.current_password} onChange={(e) => clave.setData('current_password', e.target.value)} error={clave.errors.current_password} />
                        </FormField>
                        <FormField label="Nueva contraseña" htmlFor="password" error={clave.errors.password} required>
                            <Input id="password" type="password" autoComplete="new-password" value={clave.data.password} onChange={(e) => clave.setData('password', e.target.value)} error={clave.errors.password} />
                        </FormField>
                        <FormField label="Repite la nueva contraseña" htmlFor="password_confirmation" required>
                            <Input id="password_confirmation" type="password" autoComplete="new-password" value={clave.data.password_confirmation} onChange={(e) => clave.setData('password_confirmation', e.target.value)} />
                        </FormField>
                        <Button type="submit" variant="secondary" icon={KeyRound} disabled={clave.processing} className="self-start">
                            Cambiar contraseña
                        </Button>
                    </form>
                </Panel>
            </div>
        </AdminLayout>
    );
}

/** Mi perfil: los datos llegan de la API (GET /api/admin/perfil). */
export default function Perfil() {
    return (
        <PantallaApi url="/admin/perfil" titulo="Mi perfil">
            {({ datos }) => <PerfilFormulario usuario={datos} />}
        </PantallaApi>
    );
}
