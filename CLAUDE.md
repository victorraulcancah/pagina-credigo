# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Responder siempre en español.** Web pública de CrediGo (financiamiento semanal para conductores de Yango e InDrive) con su panel `/admin`. Laravel 13 + Inertia 3 + React 19 + Tailwind 4 + Sanctum, tests con Pest. Contexto de producto y diseño en `PRODUCT.md` y `DESIGN.md` (colores, tipografía Instrument Sans).

## Comandos

```bash
composer setup                       # instala, copia .env, key:generate, migra y compila
composer dev                         # php artisan serve + queue:listen + vite (concurrently)
composer test                        # config:clear + php artisan test
php artisan test --filter=NombreDelTest                      # un test por nombre
php artisan test tests/Feature/SolicitudesTest.php           # un archivo
vendor/bin/pint                      # formato PHP
npm run build                        # compila el frontend (no hay linter JS)
php artisan db:seed                  # AdminSeeder (usa ADMIN_EMAIL/ADMIN_PASSWORD/ADMIN_NAME del .env), ConfiguracionSeeder, ContenidoSeeder
```

- Tests: SQLite en memoria (`phpunit.xml`), `ERP_URL` vacío; los tests del ERP usan `Http::fake`. `tests/Pest.php` aplica `RefreshDatabase` a `tests/Feature`.
- Desarrollo local contra MySQL (`pagina_credigo`); sesiones y cola en base de datos.
- Alias `@` → `resources/js` (ver `vite.config.js`).

## Integración con el ERP

La web **solo lee** la API pública del ERP (`ERP_URL`, `/api/app`: talleres, comercios, cupones y precios de planes) mediante `App\Services\Erp\ClienteErp`, que nunca lanza excepciones (devuelve `null` y registra en el log) y guarda una copia en caché (`ERP_CACHE_MINUTOS`) para seguir funcionando si el ERP cae. Sin `ERP_URL` la web funciona sin esos datos. En sentido inverso, el ERP lee las visitas con `GET /api/estadisticas/visitas` usando `ESTADISTICAS_TOKEN` (el mismo valor va en `PAGINA_WEB_TOKEN` del ERP; vacío = nadie puede leerlas).

## Configuración del sitio

`config/sitio.php` define las claves editables desde `/admin/configuracion` y sus valores por defecto; lo guardado en la tabla `configuraciones` los reemplaza, y solo se aceptan las claves listadas ahí. Para añadir un ajuste nuevo hay que agregarlo a `defaults`.

## Arquitectura de pagina-credigo

Mismo patrón que el ERP (`C:\laragon\www\credigo`): **Service** para la lógica, **FormRequest** para validar, **Resource** para la salida y **API REST** para todos los datos: páginas públicas, panel, login, formularios y descargas.

- `app/Services/`: un Service por módulo (`AuthService`, `PaginaService`, `BannerService`, `SeccionService`, `ServicioService`, `OpcionPlanService`, `DocumentoService`, `PreguntaFrecuenteService`, `SolicitudService`, `ReclamacionService`, `ConfiguracionService`, `PerfilService`, `DashboardService`, `SeoService`, `ArticuloService`, `ReservaService`, `TestimonioService`…; los del ERP en `Services/Erp`). Reciben datos ya validados (arrays), nunca el Request.
- `app/Http/Requests/` (públicos), `Requests/Admin/` (panel) y `Requests/Auth/LoginRequest`: toda entrada se valida en un FormRequest, también los filtros de listas.
- `app/Http/Resources/`: todo lo que sale pasa por un Resource, que decide qué campos se ven (nunca rutas de archivos, IP ni datos privados). `JsonResource::withoutWrapping()` está activo.
- **API REST** (`routes/api.php`), respuesta `{ success, message, data[, pagination, opciones…] }` con `App\Traits\ApiResponseTrait` (los controladores extienden `Api\BaseApiController`):
  - Páginas públicas: `GET /api/paginas/{pagina}` y `/api/paginas/planes/{slug}` (todo lo que muestra cada página en una respuesta, armado en `PaginaService`). También recursos sueltos: `/api/planes`, `/api/banners`, `/api/secciones`, `/api/documentos`, `/api/talleres`…
  - Formularios: `/api/solicitudes`, `/api/reclamaciones`, `/api/reclamaciones/consultar`; constancia con dirección firmada.
  - Sesión: `POST /api/login` y `/api/logout`. Desde el navegador abre la sesión (Sanctum SPA, cookie + XSRF, sin tokens guardados); desde una app u otro sistema devuelve un token Bearer.
  - Panel (`/api/admin/...`, `auth:sanctum`): CRUD con `apiResource`, bandejas paginadas y las descargas (Excel de solicitudes, adjuntos de reclamaciones).
- **Rutas web** (`routes/web.php`): solo abren pantallas Inertia, sin datos.
  - Páginas públicas: el servidor solo envía `seo` (título, descripción e imagen que app.blade.php pone en el HTML para Google y WhatsApp) y `pagina`/`slug`; responde 404 real si no existe. `robots.txt` no bloquea `/api` (Google la necesita para ver el contenido). Las visitas se cuentan con el middleware `ContarVisita`.
  - Panel y `/login`: `Route::inertia(...)`. `sitemap.xml` y `robots.txt` siguen en la raíz (los buscadores los piden ahí).
  - Única prop compartida de Inertia: `sitio` (logo, colores, nombre, contacto, redes), para que el marco no parpadee; también está en `/api/sitio`. El usuario conectado (`GET /api/sesion`), el menú de planes (`GET /api/menu`) y los contadores del panel (`GET /api/admin/contadores`) se piden a la API con `useCompartido` (una vez por visita, repartido a todos los componentes; `refrescarCompartido(url)` tras un cambio).
- **Frontend** (`resources/js`: `pages/Web`, `pages/Admin`, `pages/Auth`, `components`, `hooks`, `lib`):
  - `@/lib/api` (axios). `<PaginaApi url>` en las páginas públicas y `<PantallaApi url titulo>` en el panel: piden los datos y muestran la pantalla cuando llegan (con "Reintentar" si falla). `useConsulta(url, params)` para pedir datos; `useListaFiltrada` para bandejas con filtros y páginas (los filtros quedan en la URL); `<Paginacion>`.
  - Para guardar: `useFormApi` (forma de `useForm`), `useCrudModal` (listas con modal) y `useAccionApi` (acciones sueltas). Tras guardar avisan con el mensaje de la API y llaman a `recargar` (la de `useConsulta`). La configuración y el perfil recargan la página para refrescar el logo, los colores y el nombre.
  - Las opciones de un formulario (categorías, estados, asesores…) vienen en `opciones` junto a `data`. En `<PaginaApi>` las claves del primer nivel pasan a camelCase (`cuota_semanal` → `cuotaSemanal`).
- **Tests** (Pest): contra la API (`/api/...`, `assertJsonValidationErrors`, `Sanctum::actingAs`). Contenido de páginas públicas con el helper `paginaApi('servicios', fn (AssertableJson $page) => ...)` de `tests/Pest.php`.

<laravel-boost-guidelines>
# Laravel Application

This repository contains a Laravel application. Complete the following setup before working on the user's request.

## Prerequisites

Verify that PHP and Composer are available:

```sh
php -v
composer -V
```

If either command is unavailable, detect the user's operating system and install the prerequisites with the appropriate command:

macOS:

```sh
/bin/bash -c "$(curl -fsSL https://php.new/install/mac/8.5)"
```

Windows PowerShell:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.5'))
```

Linux:

```sh
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.5)"
```

After installation, ask the user to restart their terminal. If the agent needs the restarted shell to continue, ask the user to reopen their terminal and rerun their original prompt.

## Agent Setup

Install Laravel Boost from the application root before making application changes:

```sh
composer require laravel/boost --dev
php artisan boost:install
```

Boost replaces these bootstrap instructions with guidelines tailored to the application. After installation, read `AGENTS.md` again and continue with the user's original request using the generated guidelines.
</laravel-boost-guidelines>
