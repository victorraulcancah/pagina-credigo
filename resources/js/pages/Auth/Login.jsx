import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, LogIn } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import { useFormApi } from '@/hooks/useFormApi';
import { useSitio, useTemaColores } from '@/hooks/useSitio';

export default function Login() {
    const sitio = useSitio();
    useTemaColores();
    const [verPassword, setVerPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useFormApi({ email: '', password: '', remember: false });

    const enviar = (e) => {
        e.preventDefault();
        // POST /api/login: si los datos son correctos inicia la sesión y dice a dónde ir
        post('/login', { recargar: false, avisar: false, onSuccess: (respuesta) => router.visit(respuesta.redirect ?? '/admin') }).then(
            ({ success }) => !success && reset('password'),
        );
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-clip bg-primary px-4 py-12">
            <Head title={`Acceso al sistema - ${sitio.empresa_nombre}`} />
            <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-32 size-96 resplandor-acento" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-32 size-96 resplandor-claro" />

            <div className="relative w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <Link href="/" aria-label="Ir al sitio">
                        <img src={sitio.logo} alt={sitio.empresa_nombre} className="h-16 w-auto object-contain sm:h-20" />
                    </Link>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-10">
                    <h1 className="text-2xl font-bold text-primary sm:text-3xl">Acceso al sistema</h1>
                    <p className="mt-1 text-sm text-primary-700/80">Ingresa para administrar el sitio web.</p>

                    <form onSubmit={enviar} className="mt-8 flex flex-col gap-5" noValidate>
                        <FormField label="Correo" htmlFor="email" error={errors.email}>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="username"
                                autoFocus
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                            />
                        </FormField>

                        <FormField label="Contraseña" htmlFor="password" error={errors.password}>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={verPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={errors.password}
                                    className="pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setVerPassword((v) => !v)}
                                    aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-primary-400 hover:text-primary"
                                >
                                    {verPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                </button>
                            </div>
                        </FormField>

                        <label className="flex items-center gap-2 text-sm text-primary-700">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="size-4 rounded border-primary-300 accent-primary"
                            />
                            Recordarme
                        </label>

                        <Button type="submit" variant="secondary" size="lg" icon={LogIn} fullWidth disabled={processing}>
                            {processing ? 'Ingresando...' : 'Ingresar'}
                        </Button>
                    </form>
                </div>

                <Link href="/" className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-white/80 hover:text-white">
                    <ArrowLeft className="size-4" /> Volver al sitio
                </Link>
            </div>
        </div>
    );
}
