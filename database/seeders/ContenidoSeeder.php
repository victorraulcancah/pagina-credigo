<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\PreguntaFrecuente;
use App\Models\Seccion;
use App\Models\Servicio;
use Illuminate\Database\Seeder;

/**
 * Contenido inicial de la web. Las secciones se crean solo si no existen
 * (no pisa lo editado); servicios, preguntas y banners solo si la tabla está vacía.
 */
class ContenidoSeeder extends Seeder
{
    public function run(): void
    {
        $this->secciones();
        $this->servicios();
        $this->preguntas();
        $this->banners();
    }

    private function secciones(): void
    {
        $secciones = [
            // ── Inicio ──────────────────────────────────────────────
            ['inicio', 'servicios', 'Inicio · Encabezado de servicios', ['subtitulo', 'titulo', 'contenido', 'boton'], [
                'subtitulo' => 'Lo que ofrecemos',
                'titulo' => 'Soluciones pensadas para conductores',
                'contenido' => 'Financiamiento y productos para que sigas generando ingresos con tu vehículo.',
                'boton_texto' => 'Ver todos los servicios',
                'boton_url' => '/servicios',
            ]],
            ['inicio', 'nosotros', 'Inicio · Resumen de nosotros', ['subtitulo', 'titulo', 'contenido', 'imagen', 'boton'], [
                'subtitulo' => 'Sobre nosotros',
                'titulo' => 'Impulsamos a los conductores de aplicativo',
                'contenido' => 'En CrediGo acompañamos a los conductores de Yango e InDrive con financiamiento accesible y atención cercana.',
                'boton_texto' => 'Conócenos',
                'boton_url' => '/nosotros',
            ]],
            ['inicio', 'como_funciona', 'Inicio · Cómo funciona', ['subtitulo', 'titulo', 'contenido', 'items'], [
                'subtitulo' => 'Cómo funciona',
                'titulo' => 'Tu financiamiento en 4 pasos',
                'contenido' => 'Un proceso simple y acompañado por nuestros asesores.',
                'items' => [
                    ['titulo' => 'Contáctanos', 'descripcion' => 'Escríbenos por WhatsApp o llena el formulario y un asesor te atenderá.', 'icono' => 'MessageCircle'],
                    ['titulo' => 'Inscríbete', 'descripcion' => 'Registramos tus datos y eliges el plan que mejor se adapta a ti.', 'icono' => 'ClipboardCheck'],
                    ['titulo' => 'Paga tus cuotas', 'descripcion' => 'Realiza tus pagos semanales con tu código de pago.', 'icono' => 'Wallet'],
                    ['titulo' => 'Recibe tu vehículo', 'descripcion' => 'Accede a tu vehículo o producto y sigue generando ingresos.', 'icono' => 'Car'],
                ],
            ]],

            // ── Nosotros ────────────────────────────────────────────
            ['nosotros', 'hero', 'Nosotros · Encabezado', ['subtitulo', 'titulo', 'contenido'], [
                'subtitulo' => 'Sobre nosotros',
                'titulo' => 'Somos CrediGo',
                'contenido' => 'Financiamiento para conductores de aplicativo, con atención cercana y condiciones claras.',
            ]],
            ['nosotros', 'historia', 'Nosotros · Historia', ['subtitulo', 'titulo', 'contenido', 'imagen'], [
                'subtitulo' => 'Nuestra historia',
                'titulo' => 'Nacimos para impulsar a los conductores',
                'contenido' => "CrediGo es una marca de Arequipa Go S.A.C. que ofrece financiamiento a conductores de plataformas como Yango e InDrive.\n\nSabemos que tu vehículo es tu herramienta de trabajo. Por eso creamos planes con cuotas semanales, productos para tu día a día y beneficios por tu productividad.",
            ]],
            ['nosotros', 'mision', 'Nosotros · Misión', ['titulo', 'contenido'], [
                'titulo' => 'Misión',
                'contenido' => 'Brindar financiamiento accesible y responsable a los conductores de aplicativo para que mejoren sus ingresos y su calidad de vida.',
            ]],
            ['nosotros', 'vision', 'Nosotros · Visión', ['titulo', 'contenido'], [
                'titulo' => 'Visión',
                'contenido' => 'Ser la empresa de financiamiento de referencia para los conductores de aplicativo del Perú.',
            ]],
            ['nosotros', 'valores', 'Nosotros · Valores', ['subtitulo', 'titulo', 'items'], [
                'subtitulo' => 'Nuestros valores',
                'titulo' => 'Lo que nos guía',
                'items' => [
                    ['titulo' => 'Transparencia', 'descripcion' => 'Condiciones claras desde el primer día.', 'icono' => 'ShieldCheck'],
                    ['titulo' => 'Cercanía', 'descripcion' => 'Te acompañamos en cada etapa de tu financiamiento.', 'icono' => 'Handshake'],
                    ['titulo' => 'Compromiso', 'descripcion' => 'Trabajamos para que alcances tus metas.', 'icono' => 'Target'],
                    ['titulo' => 'Innovación', 'descripcion' => 'Usamos tecnología para darte un mejor servicio.', 'icono' => 'Rocket'],
                ],
            ]],

            // ── Servicios ───────────────────────────────────────────
            ['servicios', 'hero', 'Servicios · Encabezado', ['subtitulo', 'titulo', 'contenido'], [
                'subtitulo' => 'Nuestros servicios',
                'titulo' => 'Todo lo que necesitas para trabajar',
                'contenido' => 'Financiamiento vehicular, celulares y productos en cuotas para conductores de aplicativo.',
            ]],

            // ── Contacto ────────────────────────────────────────────
            ['contacto', 'hero', 'Contacto · Encabezado', ['subtitulo', 'titulo', 'contenido'], [
                'subtitulo' => 'Contáctanos',
                'titulo' => 'Hablemos',
                'contenido' => 'Escríbenos y un asesor te responderá a la brevedad.',
            ]],
            ['contacto', 'formulario', 'Contacto · Formulario', ['titulo', 'contenido'], [
                'titulo' => 'Envíanos un mensaje',
                'contenido' => 'Déjanos tus datos y te contactaremos.',
            ]],

            // ── Bloques que se repiten en varias páginas ────────────
            ['general', 'cifras', 'General · Cifras', ['subtitulo', 'titulo', 'items'], [
                'subtitulo' => 'CrediGo en cifras',
                'titulo' => 'Crecemos junto a nuestros conductores',
                'items' => [
                    ['titulo' => '+650', 'descripcion' => 'Conductores', 'icono' => null],
                    ['titulo' => '+600', 'descripcion' => 'Financiamientos', 'icono' => null],
                    ['titulo' => '2', 'descripcion' => 'Ciudades', 'icono' => null],
                    ['titulo' => '2', 'descripcion' => 'Plataformas aliadas', 'icono' => null],
                ],
            ]],
            ['general', 'faq', 'General · Preguntas frecuentes (encabezado)', ['subtitulo', 'titulo', 'contenido'], [
                'subtitulo' => 'Preguntas frecuentes',
                'titulo' => 'Resolvemos tus dudas',
                'contenido' => 'Si no encuentras tu respuesta, escríbenos por WhatsApp.',
            ]],
            ['general', 'cta', 'General · Llamada a la acción', ['titulo', 'contenido', 'boton'], [
                'titulo' => '¿Listo para empezar?',
                'contenido' => 'Un asesor te explica los planes y requisitos sin compromiso.',
                'boton_texto' => 'Escríbenos',
                'boton_url' => '/contacto',
            ]],
        ];

        foreach ($secciones as $orden => [$pagina, $clave, $nombre, $campos, $datos]) {
            Seccion::firstOrCreate(
                ['pagina' => $pagina, 'clave' => $clave],
                [...$datos, 'nombre' => $nombre, 'campos' => $campos, 'orden' => $orden],
            );
        }
    }

    private function servicios(): void
    {
        if (Servicio::exists()) {
            return;
        }

        $servicios = [
            ['Financiamiento vehicular', 'Car', true, 'Accede a tu auto a través de nuestros grupos de financiamiento con cuotas semanales. El vehículo se adjudica por sorteo o con cuota inicial.'],
            ['CrediYango', 'BadgeCheck', true, 'Plan de financiamiento vehicular para conductores de Yango, con cuota inicial y pagos semanales.'],
            ['Motos y mototaxis', 'Bike', true, 'Financia tu moto lineal o mototaxi y empieza a generar ingresos.'],
            ['Celulares', 'Smartphone', true, 'Financiamos tu celular para que trabajes con los aplicativos, en cuotas cómodas.'],
            ['Productos para tu vehículo', 'Wrench', false, 'Llantas, baterías, aceite y mantenimiento en cuotas, sin descuidar tu economía.'],
            ['Descuentos por productividad', 'BadgePercent', false, 'Cumple tu meta de viajes semanales en Yango o InDrive y obtén un descuento en tu cuota.'],
        ];

        foreach ($servicios as $orden => [$titulo, $icono, $destacado, $descripcion]) {
            Servicio::create(compact('titulo', 'icono', 'destacado', 'descripcion', 'orden'));
        }
    }

    private function preguntas(): void
    {
        if (PreguntaFrecuente::exists()) {
            return;
        }

        $preguntas = [
            ['¿Quiénes pueden acceder a un financiamiento?', 'Conductores de aplicativo que pasen la evaluación de CrediGo. Escríbenos y un asesor te indicará los requisitos según el plan que elijas.'],
            ['¿Cómo funcionan los grupos de financiamiento vehicular?', 'Te inscribes en un grupo y pagas cuotas semanales. El vehículo se adjudica mediante sorteo o con cuota inicial, y después de la entrega sigues pagando tus cuotas.'],
            ['¿Dónde pago mis cuotas?', 'Con tu código de pago puedes pagar en los canales que te indique tu asesor, como agencias de Caja Arequipa.'],
            ['¿Cómo obtengo descuento en mi cuota?', 'Si cumples tu meta de viajes semanales en Yango o InDrive y estás al día en tus pagos, recibes un descuento en tu cuota.'],
        ];

        foreach ($preguntas as $orden => [$pregunta, $respuesta]) {
            PreguntaFrecuente::create(compact('pregunta', 'respuesta', 'orden'));
        }
    }

    private function banners(): void
    {
        if (Banner::exists()) {
            return;
        }

        Banner::create([
            'titulo' => 'Tu próximo vehículo empieza aquí',
            'subtitulo' => 'Financiamiento vehicular, celulares y productos en cuotas para conductores de Yango e InDrive.',
            'boton_texto' => 'Solicitar información',
            'boton_url' => '/contacto',
            'orden' => 0,
        ]);

        Banner::create([
            'titulo' => 'Financia tu celular para trabajar',
            'subtitulo' => 'Cuotas cómodas para que no pares de generar ingresos.',
            'boton_texto' => 'Ver servicios',
            'boton_url' => '/servicios',
            'orden' => 1,
        ]);
    }
}
