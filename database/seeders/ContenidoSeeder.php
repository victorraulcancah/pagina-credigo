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
    /** Botón de "Cómo funciona" hacia la página de requisitos (también lo usa su migración). */
    public const BOTON_REQUISITOS = ['boton_texto' => '¿Qué necesito? Ver requisitos', 'boton_url' => '/requisitos'];

    /** También lo usa la migración que agrega la sección a sitios ya instalados. */
    public const OBJETIVO = [
        'titulo' => 'Objetivo',
        'contenido' => 'Que cada vez más conductores de aplicativo tengan su propio vehículo de trabajo, con planes claros, cuotas semanales accesibles y acompañamiento en cada etapa.',
    ];

    public function run(): void
    {
        self::crearSecciones();
        $this->servicios();
        $this->opcionesCotizador();
        $this->preguntas();
        $this->banners();
    }

    /**
     * Crea las secciones que falten (no pisa las ya editadas). Con $paginas crea solo
     * las de esas páginas: lo usan las migraciones que agregan páginas a sitios ya instalados.
     */
    public static function crearSecciones(array $paginas = []): void
    {
        foreach (self::definicionSecciones() as $orden => [$pagina, $clave, $nombre, $campos, $datos]) {
            if ($paginas && ! in_array($pagina, $paginas, true)) {
                continue;
            }

            Seccion::firstOrCreate(
                ['pagina' => $pagina, 'clave' => $clave],
                [...$datos, 'nombre' => $nombre, 'campos' => $campos, 'orden' => $orden],
            );
        }
    }

    /** [página, clave, nombre en el panel, campos editables, contenido inicial] */
    private static function definicionSecciones(): array
    {
        return [
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
            ['inicio', 'como_funciona', 'Inicio · Cómo funciona', ['subtitulo', 'titulo', 'contenido', 'items', 'boton'], [
                ...self::BOTON_REQUISITOS,
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
            ['nosotros', 'mision', 'Nosotros · Misión', ['titulo', 'contenido', 'imagen'], [
                'titulo' => 'Misión',
                'contenido' => 'Brindar financiamiento accesible y responsable a los conductores de aplicativo para que mejoren sus ingresos y su calidad de vida.',
            ]],
            ['nosotros', 'vision', 'Nosotros · Visión', ['titulo', 'contenido', 'imagen'], [
                'titulo' => 'Visión',
                'contenido' => 'Ser la empresa de financiamiento de referencia para los conductores de aplicativo del Perú.',
            ]],
            ['nosotros', 'objetivo', 'Nosotros · Objetivo', ['titulo', 'contenido', 'imagen'], self::OBJETIVO],
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

            // ── Requisitos ──────────────────────────────────────────
            ['requisitos', 'hero', 'Requisitos · Encabezado', ['subtitulo', 'titulo', 'contenido', 'imagen'], [
                'subtitulo' => 'Requisitos',
                'titulo' => 'Qué necesitas para inscribirte',
                'contenido' => 'Ten a la mano estos documentos y datos. Un asesor te acompaña en todo el proceso.',
            ]],
            ['requisitos', 'documentos', 'Requisitos · Documentos', ['subtitulo', 'titulo', 'contenido', 'items'], [
                'subtitulo' => 'Documentos',
                'titulo' => 'Documentos que te pediremos',
                'contenido' => 'Envíalos en foto o PDF, legibles y vigentes (máximo 5 MB cada uno).',
                'items' => [
                    ['titulo' => 'DNI o Carné de Extranjería', 'descripcion' => 'Foto de ambas caras, sin reflejos y con todos los datos legibles.', 'icono' => 'IdCard'],
                    ['titulo' => 'Licencia de conducir', 'descripcion' => 'Vigente. Foto de ambas caras.', 'icono' => 'Car'],
                    ['titulo' => 'Recibo de servicios', 'descripcion' => 'De luz, agua o internet de tu domicilio, para confirmar tu dirección.', 'icono' => 'Receipt'],
                    ['titulo' => 'Foto de perfil', 'descripcion' => 'Una selfie reciente, de frente y con buena luz.', 'icono' => 'Camera'],
                ],
            ]],
            ['requisitos', 'datos', 'Requisitos · Datos personales', ['subtitulo', 'titulo', 'contenido', 'items'], [
                'subtitulo' => 'Tus datos',
                'titulo' => 'Datos que debes tener a la mano',
                'contenido' => 'Los usamos para registrarte y coordinar contigo durante todo tu plan.',
                'items' => [
                    ['titulo' => 'Ser mayor de edad', 'descripcion' => 'Tener 18 años o más.', 'icono' => 'UserCheck'],
                    ['titulo' => 'Celular activo', 'descripcion' => 'Tu número de celular y, si tienes, un correo electrónico.', 'icono' => 'Smartphone'],
                    ['titulo' => 'Dirección y ubicación', 'descripcion' => 'Tu dirección exacta y el enlace de Google Maps de tu domicilio.', 'icono' => 'MapPin'],
                    ['titulo' => 'Plataforma en la que trabajas', 'descripcion' => 'Yango, InDrive u otra, y los datos de tu vehículo si ya tienes uno.', 'icono' => 'CarFront'],
                    ['titulo' => 'Contacto de emergencia', 'descripcion' => 'Nombre, celular y parentesco de un familiar o persona de confianza.', 'icono' => 'HeartHandshake'],
                ],
            ]],
            ['requisitos', 'proceso', 'Requisitos · Qué pasa después', ['subtitulo', 'titulo', 'contenido', 'items'], [
                'subtitulo' => 'Proceso',
                'titulo' => 'Qué pasa después de enviar tus datos',
                'items' => [
                    ['titulo' => 'Validamos tu identidad', 'descripcion' => 'Confirmamos tus datos con RENIEC y revisamos tus documentos.', 'icono' => 'Fingerprint'],
                    ['titulo' => 'Aprobamos tu registro', 'descripcion' => 'Nuestro equipo evalúa tu solicitud y te confirma la aprobación.', 'icono' => 'BadgeCheck'],
                    ['titulo' => 'Pagas tu inscripción', 'descripcion' => 'Al contado o en cuotas. Tu asesor te indica el monto según tu plan.', 'icono' => 'Wallet'],
                    ['titulo' => 'Verificación domiciliaria', 'descripcion' => 'Al recibir tu vehículo, moto o celular visitamos tu domicilio. Es válida por un año.', 'icono' => 'House'],
                ],
            ]],
            ['requisitos', 'empresas', 'Requisitos · Empresas con RUC', ['subtitulo', 'titulo', 'contenido', 'items'], [
                'subtitulo' => 'Con RUC',
                'titulo' => '¿Te inscribes como empresa?',
                'contenido' => 'Si te registras con RUC como persona jurídica, no necesitas licencia de conducir. Te pediremos:',
                'items' => [
                    ['titulo' => 'Ficha RUC', 'descripcion' => 'Ficha RUC vigente de la empresa, emitida por SUNAT.', 'icono' => 'FileText'],
                    ['titulo' => 'DNI del representante legal', 'descripcion' => 'Foto de ambas caras del documento de quien representa a la empresa.', 'icono' => 'IdCard'],
                    ['titulo' => 'Recibo de servicios', 'descripcion' => 'De la dirección de la empresa.', 'icono' => 'Receipt'],
                ],
            ]],

            // ── Cómo pagar ──────────────────────────────────────────
            ['pagos', 'hero', 'Cómo pagar · Encabezado', ['subtitulo', 'titulo', 'contenido', 'imagen'], [
                'subtitulo' => 'Pagos',
                'titulo' => 'Cómo pagar tus cuotas',
                'contenido' => 'Elige el medio que te quede más cómodo y paga seguro en nuestras cuentas oficiales.',
            ]],
            ['pagos', 'medios', 'Cómo pagar · Medios de pago', ['subtitulo', 'titulo', 'contenido', 'items'], [
                'subtitulo' => 'Medios de pago',
                'titulo' => 'Paga como prefieras',
                'contenido' => 'Después de pagar, guarda tu constancia o el número de operación.',
                'items' => [
                    ['titulo' => 'Yape o Plin', 'descripcion' => 'Paga al instante desde tu celular y guarda la captura de la operación.', 'icono' => 'Smartphone'],
                    ['titulo' => 'Transferencia o depósito', 'descripcion' => 'En BCP, BBVA, Interbank, Scotiabank o Banco de la Nación. Guarda el número de operación.', 'icono' => 'Landmark'],
                    ['titulo' => 'Caja Arequipa', 'descripcion' => 'Pide tu código de pago y úsalo dentro de las 24 horas. Si vence sin pagar, podrás pedir uno nuevo después de 72 horas.', 'icono' => 'Receipt'],
                    ['titulo' => 'Izipay desde la app', 'descripcion' => 'Paga con el código QR de Izipay y sube la captura. Nuestro equipo valida tu pago.', 'icono' => 'CreditCard'],
                    ['titulo' => 'En nuestra oficina', 'descripcion' => 'En efectivo o con tarjeta.', 'icono' => 'MapPin'],
                ],
            ]],
            // Sin cuentas al inicio: se cargan desde el panel (el bloque no se muestra vacío)
            ['pagos', 'cuentas', 'Cómo pagar · Cuentas oficiales', ['subtitulo', 'titulo', 'contenido', 'items'], [
                'subtitulo' => 'Cuentas oficiales',
                'titulo' => 'Nuestras cuentas',
                'contenido' => 'Todas están a nombre de la empresa. Toca un número para copiarlo.',
                'items' => [],
            ]],
            ['pagos', 'aviso', 'Cómo pagar · Aviso contra estafas', ['titulo', 'contenido'], [
                'titulo' => 'Cuidado con las estafas',
                'contenido' => 'Solo paga en las cuentas publicadas en esta página, a nombre de la empresa. Nunca te pediremos depósitos a cuentas personales ni desde números que no sean los oficiales. Si tienes dudas, escríbenos antes de pagar.',
            ]],
            ['pagos', 'despues', 'Cómo pagar · Después de pagar', ['subtitulo', 'titulo', 'contenido', 'items'], [
                'subtitulo' => 'Después de pagar',
                'titulo' => 'Así registramos tu pago',
                'items' => [
                    ['titulo' => 'Guarda tu constancia', 'descripcion' => 'La captura o el número de operación de tu pago.', 'icono' => 'Receipt'],
                    ['titulo' => 'Envíala a tu asesor', 'descripcion' => 'Por WhatsApp o por nuestros canales oficiales.', 'icono' => 'MessageCircle'],
                    ['titulo' => 'Registramos tu pago', 'descripcion' => 'Te confirmamos cuando quede registrado en tu plan.', 'icono' => 'BadgeCheck'],
                ],
            ]],
            ['pagos', 'descuento', 'Cómo pagar · Descuento semanal por viajes', ['subtitulo', 'titulo', 'contenido', 'boton'], [
                'subtitulo' => 'Beneficio',
                'titulo' => 'Tu cuota baja si cumples tu meta de viajes',
                'contenido' => 'Si trabajas con Yango o InDrive, cumples la meta de viajes de la semana y estás al día en tus pagos, tu cuota de la semana siguiente tiene descuento. Consulta con tu asesor la meta y el descuento de tu plan.',
                'boton_texto' => 'Consultar con un asesor',
                'boton_url' => '/soporte',
            ]],

            // ── Talleres aliados (la lista viene del ERP) ────────────
            ['talleres', 'hero', 'Talleres aliados · Encabezado', ['subtitulo', 'titulo', 'contenido', 'imagen'], [
                'subtitulo' => 'Talleres aliados',
                'titulo' => 'Mantén tu vehículo y págalo en cuotas',
                'contenido' => 'Mecánica, llantas, baterías, aceite y más en nuestra red de talleres aliados, con una inicial y el resto en cuotas.',
            ]],
            ['talleres', 'como', 'Talleres aliados · Cómo funciona', ['subtitulo', 'titulo', 'contenido', 'items'], [
                'subtitulo' => 'Cómo funciona',
                'titulo' => 'Financia tu servicio en 4 pasos',
                'items' => [
                    ['titulo' => 'Elige tu taller', 'descripcion' => 'Revisa los servicios, precios y horarios de cada taller aliado.', 'icono' => 'Wrench'],
                    ['titulo' => 'Solicítalo', 'descripcion' => 'Desde la app CrediGO o con tu asesor.', 'icono' => 'Smartphone'],
                    ['titulo' => 'Paga tu inicial', 'descripcion' => 'Y confirmamos tu financiamiento con el taller.', 'icono' => 'Wallet'],
                    ['titulo' => 'Atiéndete y paga en cuotas', 'descripcion' => 'Nosotros le pagamos al taller y tú pagas el resto en cuotas.', 'icono' => 'CalendarCheck'],
                ],
            ]],

            // ── Beneficios (puntaje y niveles según el ERP; comercios y cupones vienen del ERP) ──
            ['beneficios', 'hero', 'Beneficios · Encabezado', ['subtitulo', 'titulo', 'contenido', 'imagen'], [
                'subtitulo' => 'Beneficios',
                'titulo' => 'Mientras más cumples, más ganas',
                'contenido' => 'Tu puntaje y tu nivel te abren más opciones. Además, descuentos en comercios aliados.',
            ]],
            ['beneficios', 'puntaje', 'Beneficios · Puntaje CrediGo', ['subtitulo', 'titulo', 'contenido', 'items'], [
                'subtitulo' => 'Puntaje CrediGo',
                'titulo' => 'Tu puntaje depende de cómo pagas',
                'contenido' => 'Todos empiezan con 100 puntos. Se actualiza cada día y lo ves en la app CrediGO.',
                'items' => [
                    ['titulo' => 'Pagas a tiempo', 'descripcion' => 'Sumas 3 puntos por cada cuota pagada a tiempo (1 punto si tienes dos o más financiamientos activos).', 'icono' => 'BadgeCheck'],
                    ['titulo' => 'Te atrasas', 'descripcion' => 'Restas 5 puntos por cada cuota que se vence sin pagar.', 'icono' => 'Clock'],
                    ['titulo' => 'Lo revisas cuando quieras', 'descripcion' => 'Tu puntaje se actualiza cada día en la app CrediGO.', 'icono' => 'Smartphone'],
                ],
            ]],
            ['beneficios', 'rangos', 'Beneficios · Qué permite cada puntaje', ['subtitulo', 'titulo', 'contenido', 'items'], [
                'subtitulo' => 'Qué puedes solicitar',
                'titulo' => 'Tu puntaje define tus opciones',
                'items' => [
                    ['titulo' => '90 a 100 · Excelente', 'descripcion' => 'Accedes a todos los beneficios.', 'icono' => null],
                    ['titulo' => '70 a 89 · Bueno', 'descripcion' => 'Accedes a todos los beneficios: talleres, celulares, chip y vehículos.', 'icono' => null],
                    ['titulo' => '50 a 69 · Regular', 'descripcion' => 'Solo puedes solicitar financiamiento de vehículos.', 'icono' => null],
                    ['titulo' => 'Menos de 50', 'descripcion' => 'Aún no puedes solicitar nuevos financiamientos. Ponte al día para recuperar puntos.', 'icono' => null],
                ],
            ]],
            ['beneficios', 'niveles', 'Beneficios · Niveles y condiciones', ['subtitulo', 'titulo', 'contenido', 'items'], [
                'subtitulo' => 'Niveles',
                'titulo' => 'Sube de nivel y paga menos de inicial',
                'contenido' => 'Tu nivel sube con cada financiamiento que terminas de pagar. Porcentajes referenciales: tu asesor confirma las condiciones de cada financiamiento.',
                'items' => [
                    ['titulo' => 'Bronce', 'descripcion' => 'Con 3 financiamientos terminados. Inicial de 30 % en talleres y 40 % en celulares.', 'icono' => 'Medal'],
                    ['titulo' => 'Plata', 'descripcion' => 'Con 6 financiamientos terminados. Inicial de 20 % en talleres y 30 % en celulares.', 'icono' => 'Award'],
                    ['titulo' => 'Oro', 'descripcion' => 'Con 9 financiamientos terminados. Inicial de 10 % en talleres y 20 % en celulares.', 'icono' => 'Crown'],
                ],
            ]],
            ['beneficios', 'cupones', 'Beneficios · Cupones (vienen del ERP)', ['subtitulo', 'titulo', 'contenido'], [
                'subtitulo' => 'Cupones',
                'titulo' => 'Cupones vigentes',
                'contenido' => 'Descuentos para nuestra comunidad. Úsalos desde la app CrediGO.',
            ]],
            ['beneficios', 'comercios', 'Beneficios · Comercios GO (vienen del ERP)', ['subtitulo', 'titulo', 'contenido'], [
                'subtitulo' => 'Comercios GO',
                'titulo' => 'Comercios aliados cerca de ti',
                'contenido' => 'Restaurantes, farmacias, tiendas y más con beneficios para ti.',
            ]],

            // ── Cotizador ───────────────────────────────────────────
            ['cotizador', 'hero', 'Cotizador · Encabezado', ['subtitulo', 'titulo', 'contenido', 'imagen'], [
                'subtitulo' => 'Cotizador',
                'titulo' => 'Cotiza tu plan en segundos',
                'contenido' => 'Elige el plan y la opción que te interesa, revisa las cuotas referenciales y un asesor te contacta.',
            ]],

            // ── Soporte (página /soporte; en la BD sigue siendo "contacto") ──
            ['contacto', 'hero', 'Soporte · Encabezado', ['subtitulo', 'titulo', 'contenido', 'imagen'], [
                'subtitulo' => 'Soporte',
                'titulo' => 'Hablemos',
                'contenido' => 'Escríbenos y un asesor te responderá a la brevedad.',
            ]],
            ['contacto', 'formulario', 'Soporte · Formulario', ['titulo', 'contenido'], [
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
                'boton_url' => '/soporte',
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
            'boton_url' => '/soporte',
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
