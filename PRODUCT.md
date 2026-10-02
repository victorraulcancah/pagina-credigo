# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primario (confirmado): conductores de aplicativo que aún no son clientes.** Trabajan a diario con Yango o InDrive (en Arequipa también ATU/SETARE), en Arequipa y Lima. Quieren su propio vehículo de trabajo (auto o moto) o equipamiento para trabajar (celular, mantenimiento). Su tarea en la web: entender qué plan les conviene, cuánto pagarían por semana, qué requisitos piden, y pasar a hablar con un asesor o cotizar.
- **Secundario: asociados actuales.** Buscan cómo pagar, soporte, el Libro de Reclamaciones (consulta de su reclamo) y sus beneficios. El día a día de sus cuotas y su puntaje lo resuelven en la app CrediGO, no en la web.
- **Interno: equipo de CrediGo.** Administra todo el contenido y atiende las solicitudes desde el panel `/admin`.

## Product Purpose

Web pública de CrediGo, marca de AREQUIPA GO S.A.C. Su trabajo principal es **convertir conductores nuevos en solicitudes calificadas**: formulario de Soporte, cotizador y WhatsApp con un asesor. Esas solicitudes llegan al panel, donde el equipo les da seguimiento (estado, asignación, notas, Excel).

La web también informa planes, requisitos, formas de pago, talleres aliados y beneficios, y cumple obligaciones legales: Libro de Reclamaciones virtual (Indecopi) y consentimiento de datos personales (Ley 29733).

Éxito = más conductores nuevos que cotizan o escriben a un asesor.

## Positioning

> Derivado de la documentación y del ERP; el negocio no lo formuló de forma explícita. Confirmar antes de convertirlo en mensajes centrales.

- **Hecho para quien maneja en aplicativo:** cuotas semanales que siguen el ritmo del ingreso semanal del conductor.
- **Socio de flota oficial de Yango e InDrive** (confirmado). Si el conductor cumple la meta de viajes de la semana y está al día, su cuota de la semana siguiente baja. En Yango el descuento se aplica de forma automática; los descuentos de Yango e InDrive pueden sumarse.
- **Dos caminos al vehículo:**
  - **Grupos de ahorro con adjudicación:** por sorteo mensual, directa con inicial, o automática a las 14 cuotas (motos) o a las 52 (autos).
  - **CrediYango:** inicial y cuotas fijas, con entrega directa.
- **Un ecosistema alrededor del trabajo del conductor:** celulares, chip corporativo, talleres aliados con mantenimiento financiado, Comercios GO y cupones. El Puntaje CrediGo y los niveles Bronce, Plata y Oro mejoran las condiciones.
- **No confirmado:** que no se necesite historial crediticio. No publicar esa afirmación sin confirmación del negocio.

## Operating Context

- **Uso desde el celular**, muchas veces entre viajes y con datos móviles. **WhatsApp** es el canal real de cierre: el conductor decide hablando con un asesor.
- Idioma: español de Perú. Ciudades publicadas: Arequipa y Lima (el ERP también registra La Libertad y Callao).
- **Lo que pasa después:**
  - La solicitud llega al CRM del panel.
  - El asesor evalúa y el cliente paga la inscripción.
  - El cliente pasa a usar la app CrediGO: cuotas, pagos con código de Caja Arequipa o QR de Izipay, puntaje y cupones.
- **ERP de CrediGo:** es la fuente de verdad del catálogo. La web solo lee, con una copia en caché, talleres, Comercios GO, cupones públicos y precios de planes.

## Capabilities and Constraints

- **Stack existente:**
  - Laravel 13, Inertia, React 19 y Tailwind CSS v4.
  - Todo el contenido (textos, imágenes, colores, logo, secciones, planes, preguntas frecuentes, cotizador) se edita desde `/admin`.
- **Páginas:** inicio, nosotros, servicios, cotizador, requisitos, cómo pagar, talleres aliados, beneficios, soporte, Libro de Reclamaciones (registro, constancia, consulta) y páginas legales.
- **Legal:**
  - Libro de Reclamaciones conforme a Indecopi: respuesta en 15 días hábiles.
  - Aceptación de la política de privacidad en cada formulario (Ley 29733).
  - El modelo de grupos de ahorro con sorteo podría estar regulado por la SMV (fondos colectivos): los textos de los planes necesitan revisión legal.
  - Los montos son referenciales.
  - No publicar tasas de interés.
- **Datos del ERP:**
  - Nunca se muestran RUC, correos, teléfonos de contacto, datos bancarios, tasas, comisiones ni contratos.
  - Si el ERP no responde, la web sigue con la última copia.
- **Terminología:** asociado, inscripción, cuota semanal, adjudicación (sorteo / directa / automática), certificado (13k, 15k o 17k USD), CrediYango, Credi Ahorros Autos, Credi Motos, CrediGo InDriver, Comercios GO, Puntaje CrediGo, niveles Bronce, Plata y Oro, Libro de Reclamaciones.
- **Decisiones abiertas:**
  - cuentas bancarias oficiales (aún no cargadas);
  - enlaces de la app en Play Store y App Store (desconocidos);
  - % de inicial por nivel (configurados en el ERP, pero sin confirmar que se apliquen);
  - URL del ERP en producción;
  - aviso de cookies si se activan GA4 o Meta Pixel.

## Brand Commitments

- **Nombre:** CrediGo. **Empresa:** AREQUIPA GO S.A.C. (RUC 20612112763). **Eslogan actual:** "Financiamiento para conductores de aplicativo".
- **Colores de marca definidos por el usuario (obligatorios):** azul profundo `#0f1037` y amarillo `#f8ec34`. Se guardan en la base de datos y se cambian desde el panel.
- **Logo:**
  - `public/images/logos/credigo.png`, versión sobre fondo amarillo.
  - El logo cargado en el panel es blanco con "GO" amarillo: necesita fondo oscuro.
- **Voz:** cercana y directa, de tú, español peruano. Ejemplos en uso: "Anda con el tuyo", "Tu propio vehículo, ahorrando mientras trabajas".
- **Referencias de otras marcas:** se usan solo como estructura. El usuario pidió expresamente no copiar sus colores.

## Evidence on Hand

- **Confirmado por el usuario como real:** "650+ conductores financiados", "2 ciudades: Arequipa y Lima", "Yango · InDrive socios de flota oficiales".
- **Del ERP (solo lectura):** catálogo de planes y precios, talleres aliados, cupones públicos, Comercios GO y reglas de puntaje y niveles. La copia local del ERP está desactualizada.
- **No existen todavía y no deben inventarse:** testimonios, fotos reales de entregas, reseñas, logos de clientes, prensa, montos de inscripción por ciudad publicados y cuentas bancarias. Las imágenes actuales del banner y de los planes son provisionales y las cargó el usuario.

## Product Principles

1. **Cada página termina en un siguiente paso claro** para el conductor: cotizar, escribir por WhatsApp o ir a Soporte.
2. **Claridad antes que promesa:** montos referenciales, requisitos y reglas explícitas. Nunca inventar cifras, tasas, testimonios ni beneficios no confirmados.
3. **Celular y WhatsApp primero:** pensar en alguien que lee rápido, en la calle y con datos limitados.
4. **El panel y el ERP mandan:** el contenido se edita en `/admin` y el catálogo viene del ERP. Ningún texto de negocio queda fijo en el código.
5. **El cumplimiento es parte del producto:** Indecopi y protección de datos no se esconden ni se omiten.

## Accessibility & Inclusion

No hay un estándar formal acordado. Necesidades conocidas o inferidas del contexto:
- lectura en celular bajo luz solar (contraste alto);
- textos claros sin jerga financiera;
- respeto de "reducir movimiento" (las animaciones ya lo cumplen);
- formularios usables con teclado y lectores de pantalla.
