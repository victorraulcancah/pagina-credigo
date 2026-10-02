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

Mismo patrón que el ERP (`C:\laragon\www\credigo`): **Service** para la lógica, **FormRequest** para validar, **Resource** para la salida y **API REST** para todo lo que guarda o borra.

- `app/Services/`: un Service por módulo (`BannerService`, `SeccionService`, `ServicioService`, `OpcionPlanService`, `DocumentoService`, `PreguntaFrecuenteService`, `SolicitudService`, `ReclamacionService`, `ConfiguracionService`, `PerfilService`, `DashboardService`; los del ERP en `Services/Erp`). Reciben datos ya validados (arrays), nunca el Request.
- `app/Http/Requests/` (públicos) y `app/Http/Requests/Admin/` (panel): toda entrada se valida en un FormRequest, también los filtros de listas.
- `app/Http/Resources/`: todo lo que sale (API y props de Inertia) pasa por un Resource, que decide qué campos se ven (nunca rutas de archivos, IP ni datos privados). `JsonResource::withoutWrapping()` está activo.
- **API REST** (`routes/api.php`), respuesta `{ success, message, data[, pagination] }` con `App\Traits\ApiResponseTrait` (los controladores extienden `Api\BaseApiController`):
  - Pública (`/api/...`): solo lectura (sitio, secciones, banners, planes, documentos, preguntas, talleres, comercios, cupones) + formularios (`/api/solicitudes`, `/api/reclamaciones`, `/api/reclamaciones/consultar`).
  - Panel (`/api/admin/...`, `auth:sanctum`): CRUD con `apiResource`. Usa la misma sesión del login (Sanctum stateful + XSRF), sin tokens en el navegador.
- **Rutas web** (`routes/web.php`): solo pantallas Inertia y descargas.
  - Panel: `Route::inertia(...)` sin datos; cada pantalla pide los suyos a la API. Solo quedan dos controladores web en `Admin/`: el Excel de solicitudes y los adjuntos de reclamaciones (son archivos).
  - Páginas públicas: reciben sus datos desde el servidor (SEO y vista previa de WhatsApp) con los mismos Services y Resources (`->resolve()`).
- **Frontend del panel**:
  - `useConsulta(url, params)` pide datos (GET); `<PantallaApi url titulo>` muestra la pantalla cuando llegan; `useListaFiltrada` para bandejas con filtros y páginas (los filtros quedan en la URL); `<Paginacion>`.
  - Para guardar: `useFormApi` (forma de `useForm`), `useCrudModal` (listas con modal) y `useAccionApi` (acciones sueltas). Tras guardar avisan con el mensaje de la API y llaman a `recargar` (la de `useConsulta`). La configuración y el perfil recargan la página para refrescar el logo, los colores y el nombre.
  - La lista de opciones de un formulario (categorías, estados, asesores…) viene en `opciones` junto a `data`.
- **Tests** (Pest): los cambios se prueban contra la API (`/api/...`, `assertJsonValidationErrors`, `Sanctum::actingAs`).
