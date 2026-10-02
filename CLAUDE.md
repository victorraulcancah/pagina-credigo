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

# Arquitectura de pagina-credigo (responder siempre en español)

Mismo patrón que el ERP (`C:\laragon\www\credigo`): **Service** para la lógica, **FormRequest** para validar, **Resource** para la salida y **API REST** para todos los datos: páginas públicas, panel, login, formularios y descargas.

- `app/Services/`: un Service por módulo (`AuthService`, `PaginaService`, `BannerService`, `SeccionService`, `ServicioService`, `OpcionPlanService`, `DocumentoService`, `PreguntaFrecuenteService`, `SolicitudService`, `ReclamacionService`, `ConfiguracionService`, `PerfilService`, `DashboardService`, `SeoService`; los del ERP en `Services/Erp`). Reciben datos ya validados (arrays), nunca el Request.
- `app/Http/Requests/` (públicos), `Requests/Admin/` (panel) y `Requests/Auth/LoginRequest`: toda entrada se valida en un FormRequest, también los filtros de listas.
- `app/Http/Resources/`: todo lo que sale pasa por un Resource, que decide qué campos se ven (nunca rutas de archivos, IP ni datos privados). `JsonResource::withoutWrapping()` está activo.
- **API REST** (`routes/api.php`), respuesta `{ success, message, data[, pagination, opciones…] }` con `App\Traits\ApiResponseTrait` (los controladores extienden `Api\BaseApiController`):
  - Páginas públicas: `GET /api/paginas/{pagina}` y `/api/paginas/planes/{slug}` (todo lo que muestra cada página en una respuesta, armado en `PaginaService`). También recursos sueltos: `/api/planes`, `/api/banners`, `/api/secciones`, `/api/documentos`, `/api/talleres`…
  - Formularios: `/api/solicitudes`, `/api/reclamaciones`, `/api/reclamaciones/consultar`; constancia con dirección firmada.
  - Sesión: `POST /api/login` y `/api/logout`. Desde el navegador abre la sesión (Sanctum SPA, cookie + XSRF, sin tokens guardados); desde una app u otro sistema devuelve un token Bearer.
  - Panel (`/api/admin/...`, `auth:sanctum`): CRUD con `apiResource`, bandejas paginadas y las descargas (Excel de solicitudes, adjuntos de reclamaciones).
- **Rutas web** (`routes/web.php`): solo abren pantallas Inertia, sin datos.
  - Páginas públicas: el servidor solo envía `seo` (título, descripción e imagen que app.blade.php pone en el HTML para Google y WhatsApp) y `pagina`/`slug`; responde 404 real si no existe. `robots.txt` no bloquea `/api` (Google la necesita para ver el contenido).
  - Panel y `/login`: `Route::inertia(...)`. `sitemap.xml` y `robots.txt` siguen en la raíz (los buscadores los piden ahí).
  - Los datos del "marco" de la página (logo, colores, menú de planes, usuario) llegan como props compartidas de Inertia para que no parpadeen; también están en `/api/sitio` y `/api/admin/perfil`.
- **Frontend**:
  - `@/lib/api` (axios). `<PaginaApi url>` en las páginas públicas y `<PantallaApi url titulo>` en el panel: piden los datos y muestran la pantalla cuando llegan (con "Reintentar" si falla). `useConsulta(url, params)` para pedir datos; `useListaFiltrada` para bandejas con filtros y páginas (los filtros quedan en la URL); `<Paginacion>`.
  - Para guardar: `useFormApi` (forma de `useForm`), `useCrudModal` (listas con modal) y `useAccionApi` (acciones sueltas). Tras guardar avisan con el mensaje de la API y llaman a `recargar` (la de `useConsulta`). La configuración y el perfil recargan la página para refrescar el logo, los colores y el nombre.
  - Las opciones de un formulario (categorías, estados, asesores…) vienen en `opciones` junto a `data`. En `<PaginaApi>` las claves del primer nivel pasan a camelCase (`cuota_semanal` → `cuotaSemanal`).
- **Tests** (Pest): contra la API (`/api/...`, `assertJsonValidationErrors`, `Sanctum::actingAs`). Contenido de páginas públicas con el helper `paginaApi('servicios', fn (AssertableJson $page) => ...)` de `tests/Pest.php`.
