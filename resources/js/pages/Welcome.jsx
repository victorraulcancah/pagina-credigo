import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Inicio" />
            <main className="min-h-screen bg-primary-600 flex items-center justify-center p-6">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-white">
                        Credi<span className="text-accent-500">Go</span>
                    </h1>
                    <p className="mt-4 text-primary-100">
                        Laravel + Inertia + React + Tailwind CSS
                    </p>
                </div>
            </main>
        </>
    );
}
