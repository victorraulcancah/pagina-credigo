<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\OpcionPlan;
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
        $this->opcionesCotizador();
        $this->preguntas();
        $this->banners();
    }

    private function secciones(): void
    {
        $secciones = [
            // ── Inicio ──────────────────────────────────────────────
            ['inicio', 'pasos_rapidos', 'Inicio · Franja de pasos (debajo del banner)', ['items'], [
                'items' => [
                    ['titulo' => 'Te registras', 'descripcion' => 'DNI/RUC verificado', 'icono' => null],
                    ['titulo' => 'Ahorras cada semana', 'descripcion' => 'como asociado del grupo', 'icono' => null],
                    ['titulo' => 'Resultas adjudicado', 'descripcion' => 'sorteo, directa o automática', 'icono' => null],
                    ['titulo' => 'Recibes tu vehículo', 'descripcion' => 'y sigues pagando como adjudicado', 'icono' => null],
                ],
            ]],
            ['inicio', 'servicios', 'Inicio · Encabezado de planes', ['subtitulo', 'titulo', 'contenido', 'boton'], [
                'subtitulo' => 'Planes',
                'titulo' => 'Elige el camino que más te conviene',
                'contenido' => 'Financiamiento vehicular, entrega inmediata con CrediYango, o financiamiento de lo que ya usas cada día.',
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
                'titulo' => 'De asociado a propietario, un pago a la vez',
                'contenido' => 'Nuestros grupos de ahorro (Credi Ahorros Autos, CrediGo Autos, Credi Motos y CrediGo InDriver) te acompañan desde la inscripción hasta la entrega de llaves.',
                'items' => [
                    ['titulo' => 'Inscripción', 'descripcion' => 'Pagas tu cuota de inscripción y quedas registrado como ahorrista del grupo elegido.', 'icono' => 'ClipboardCheck'],
                    ['titulo' => 'Cuotas semanales', 'descripcion' => 'Entre 150 y 215 cuotas, según el grupo, mientras avanzas hacia la adjudicación.', 'icono' => 'CalendarCheck'],
                    ['titulo' => 'Adjudicación', 'descripcion' => 'Por sorteo mensual, de forma directa con inicial, o automática al llegar a 14 cuotas (moto) o 52 (auto).', 'icono' => 'Trophy'],
                    ['titulo' => 'Entrega y uso', 'descripcion' => 'Recibes el vehículo y continúas pagando como adjudicado. Certificados de 13k, 15k o 17k USD.', 'icono' => 'KeyRound'],
                ],
            ]],

            // ── Nosotros ────────────────────────────────────────────
            ['nosotros', 'hero', 'Nosotros · Encabezado', ['subtitulo', 'titulo', 'contenido', 'imagen'], [
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
            ['servicios', 'hero', 'Servicios · Encabezado', ['subtitulo', 'titulo', 'contenido', 'imagen'], [
                'subtitulo' => 'Nuestros servicios',
                'titulo' => 'Todo lo que necesitas para trabajar',
                'contenido' => 'Financiamiento vehicular, celulares y productos en cuotas para conductores de aplicativo.',
            ]],

            // ── Cotizador ───────────────────────────────────────────
            ['cotizador', 'hero', 'Cotizador · Encabezado', ['subtitulo', 'titulo', 'contenido', 'imagen'], [
                'subtitulo' => 'Cotizador',
                'titulo' => 'Cotiza tu plan en segundos',
                'contenido' => 'Elige el plan y la opción que te interesa, revisa las cuotas referenciales y un asesor te contacta.',
            ]],

            // ── Contacto ────────────────────────────────────────────
            ['contacto', 'hero', 'Contacto · Encabezado', ['subtitulo', 'titulo', 'contenido', 'imagen'], [
                'subtitulo' => 'Contáctanos',
                'titulo' => 'Hablemos',
                'contenido' => 'Escríbenos y un asesor te responderá a la brevedad.',
            ]],
            ['contacto', 'formulario', 'Contacto · Formulario', ['titulo', 'contenido'], [
                'titulo' => 'Envíanos un mensaje',
                'contenido' => 'Déjanos tus datos y te contactaremos.',
            ]],

            // ── Bloques que se repiten en varias páginas ────────────
            ['general', 'cifras', 'General · Cifras (banner del inicio y Nosotros)', ['subtitulo', 'titulo', 'items'], [
                'subtitulo' => 'CrediGo en cifras',
                'titulo' => 'Crecemos junto a nuestros conductores',
                'items' => [
                    ['titulo' => '650+', 'descripcion' => 'conductores financiados', 'icono' => null],
                    ['titulo' => '2', 'descripcion' => 'ciudades: Arequipa y Lima', 'icono' => null],
                    ['titulo' => 'Yango · InDrive', 'descripcion' => 'socios de flota oficiales', 'icono' => null],
                ],
            ]],
            ['general', 'beneficios', 'General · Beneficios (niveles)', ['subtitulo', 'titulo', 'contenido', 'items'], [
                'subtitulo' => 'Beneficios',
                'titulo' => 'Cumplir tus pagos también te da ventajas',
                'contenido' => 'Un puntaje crediticio propio te ubica en un nivel de fidelización con beneficios reales.',
                'items' => [
                    ['titulo' => 'Bronce', 'descripcion' => 'Nivel de ingreso al programa de fidelización, con acceso a cupones y comercios afiliados.', 'icono' => 'Medal'],
                    ['titulo' => 'Plata', 'descripcion' => 'Mejores condiciones y mayor acceso a beneficios conforme mantienes tus pagos al día.', 'icono' => 'Award'],
                    ['titulo' => 'Oro', 'descripcion' => 'El nivel más alto: máximos beneficios en Comercios GO y en nuestra red de talleres.', 'icono' => 'Crown'],
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

            // ── Páginas legales (texto base: revisar con asesoría legal) ──
            ['legal', 'terminos', 'Legal · Términos y condiciones', ['titulo', 'contenido'], [
                'titulo' => 'Términos y condiciones',
                'contenido' => self::textoTerminos(),
            ]],
            ['legal', 'privacidad', 'Legal · Política de privacidad', ['titulo', 'contenido'], [
                'titulo' => 'Política de privacidad',
                'contenido' => self::textoPrivacidad(),
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

        foreach (self::planes() as $orden => $plan) {
            Servicio::create([...$plan, 'destacado' => true, 'orden' => $orden]);
        }
    }

    /**
     * Opciones iniciales del cotizador, solo con cifras ya publicadas en los planes.
     * Las cuotas de los grupos de ahorro quedan vacías ("consulta con un asesor")
     * hasta que se carguen desde el panel.
     */
    private function opcionesCotizador(): void
    {
        if (OpcionPlan::exists()) {
            return;
        }

        $planes = Servicio::pluck('id', 'titulo');

        if ($ahorro = $planes['Moto o auto por adjudicación'] ?? null) {
            foreach (['13k', '15k', '17k'] as $orden => $certificado) {
                OpcionPlan::create([
                    'servicio_id' => $ahorro,
                    'nombre' => "Auto · certificado {$certificado} USD",
                    'nota' => 'Adjudicación por sorteo, directa con inicial o al llegar a 52 cuotas.',
                    'moneda' => 'PEN',
                    'frecuencia' => 'semanal',
                    'orden' => $orden,
                ]);
            }
        }

        if ($yango = $planes['CrediYango'] ?? null) {
            OpcionPlan::create([
                'servicio_id' => $yango,
                'nombre' => 'Inicial de S/2,000 + 200 cuotas',
                'nota' => 'Si ya eres ahorrista, tu ahorro se descuenta de la inicial.',
                'moneda' => 'PEN',
                'inicial' => 2000,
                'cuota' => 100,
                'numero_cuotas' => 200,
                'frecuencia' => 'semanal',
            ]);
        }
    }

    /** Los 3 planes de CrediGo, cada uno con su etiqueta y características. */
    public static function planes(): array
    {
        return [
            [
                'etiqueta' => 'Grupos de ahorro',
                'titulo' => 'Moto o auto por adjudicación',
                'icono' => 'Car',
                'descripcion' => 'El plan clásico de CrediGo: ahorra semanalmente y accede a tu vehículo por sorteo o al completar tus cuotas.',
                'caracteristicas' => [
                    'Inscripción + cuotas semanales',
                    'Certificados de 13k, 15k o 17k USD',
                    'Retiro con penalidad y condonación de cuotas restantes',
                ],
            ],
            [
                'etiqueta' => 'Entrega más rápida',
                'titulo' => 'CrediYango',
                'icono' => 'Zap',
                'descripcion' => 'Para quien no quiere esperar el sorteo: inicial y cuotas fijas, con entrega más directa.',
                'caracteristicas' => [
                    'Inicial de S/2,000',
                    '200 cuotas semanales de S/100',
                    'Si ya eres ahorrista, tu ahorro se descuenta de la inicial',
                ],
            ],
            [
                'etiqueta' => 'Microfinanciamiento',
                'titulo' => 'Todo lo que tu unidad necesita',
                'icono' => 'Wrench',
                'descripcion' => 'Financia lo que mantiene tu vehículo y tu trabajo en marcha, en cuotas accesibles.',
                'caracteristicas' => [
                    'Celulares Redmi y línea corporativa Claro',
                    'Llantas, baterías, aceite y mantenimiento (IncaMotors)',
                    'SOAT, revisión técnica, GPS y canasta navideña',
                ],
            ],
        ];
    }

    /** Formato: "## " subtítulo, "- " viñeta, línea en blanco separa párrafos. */
    private static function textoTerminos(): string
    {
        return <<<'TEXTO'
            Al usar este sitio web aceptas estos términos y condiciones. Si no estás de acuerdo con ellos, te pedimos no utilizar el sitio.

            ## Información de los planes
            La información sobre planes, cuotas, montos y condiciones publicada en este sitio es referencial. Las condiciones finales de cada financiamiento se establecen en el contrato correspondiente, luego de la evaluación del cliente.

            ## Uso del sitio
            - Te comprometes a brindar información veraz en los formularios.
            - No debes usar el sitio para fines ilícitos ni para enviar contenido ofensivo o no solicitado.

            ## Propiedad intelectual
            Los textos, imágenes, logotipos y marcas de este sitio pertenecen a la empresa o a sus licenciantes y no pueden usarse sin autorización.

            ## Enlaces a terceros
            El sitio puede enlazar a servicios de terceros (como WhatsApp o redes sociales), que se rigen por sus propios términos y políticas.

            ## Libro de Reclamaciones
            Conforme al Código de Protección y Defensa del Consumidor, ponemos a tu disposición un Libro de Reclamaciones virtual en este sitio.

            ## Modificaciones
            Podemos actualizar estos términos en cualquier momento. La versión vigente es la publicada en esta página.

            ## Legislación aplicable
            Estos términos se rigen por las leyes de la República del Perú.
            TEXTO;
    }

    private static function textoPrivacidad(): string
    {
        return <<<'TEXTO'
            En cumplimiento de la Ley N° 29733, Ley de Protección de Datos Personales, te informamos cómo tratamos los datos personales que nos proporcionas a través de este sitio web.

            ## Datos que recopilamos
            - Nombres, documento de identidad, teléfono, correo electrónico y domicilio que ingresas en nuestros formularios.
            - La información sobre el servicio que te interesa y el contenido de tus mensajes o reclamos.

            ## Finalidades
            - Atender tus consultas, solicitudes y reclamos.
            - Contactarte para darte la información que solicitaste sobre nuestros planes de financiamiento.
            - Cumplir obligaciones legales, como las del Libro de Reclamaciones.

            ## Plazo de conservación
            Conservamos tus datos mientras sean necesarios para las finalidades descritas o durante el plazo que exija la ley.

            ## Tus derechos
            Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición escribiendo a nuestro correo de contacto. Si consideras que no fueron atendidos, puedes acudir a la Autoridad Nacional de Protección de Datos Personales.

            ## Seguridad
            Aplicamos medidas técnicas y organizativas para proteger tus datos contra pérdida, uso indebido o acceso no autorizado.

            ## Cambios en esta política
            Podemos actualizar esta política. La versión vigente es la publicada en esta página.
            TEXTO;
    }

    /** Textos del banner principal del inicio. */
    public static function bannerPrincipal(): array
    {
        return [
            'etiqueta' => 'Anda con el tuyo — Arequipa y Lima',
            'titulo' => 'Tu propio vehículo, ahorrando mientras trabajas.',
            'subtitulo' => 'Financiamos motos y autos para conductores de Yango e InDrive. Ahorra semanalmente, resulta adjudicado y trabaja con tu propio vehículo, sin dejar de generar ingresos mientras esperas.',
            'boton_texto' => 'Empieza tu ahorro',
            'boton_url' => '/contacto',
            'boton2_texto' => 'Ver cómo funciona',
            'boton2_url' => '/#como-funciona',
        ];
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

        Banner::create([...self::bannerPrincipal(), 'orden' => 0]);

        Banner::create([
            'titulo' => 'Financia tu celular para trabajar',
            'subtitulo' => 'Cuotas cómodas para que no pares de generar ingresos.',
            'boton_texto' => 'Ver servicios',
            'boton_url' => '/servicios',
            'orden' => 1,
        ]);
    }
}
