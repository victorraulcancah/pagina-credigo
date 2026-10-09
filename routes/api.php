<?php

use App\Http\Controllers\Api\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Api\Admin\ConfiguracionController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\DocumentoController as AdminDocumentoController;
use App\Http\Controllers\Api\Admin\ErpController;
use App\Http\Controllers\Api\Admin\OpcionPlanController;
use App\Http\Controllers\Api\Admin\PerfilController;
use App\Http\Controllers\Api\Admin\PreguntaFrecuenteController;
use App\Http\Controllers\Api\Admin\ReclamacionController as AdminReclamacionController;
use App\Http\Controllers\Api\Admin\SeccionController;
use App\Http\Controllers\Api\Admin\ServicioController;
use App\Http\Controllers\Api\Admin\SolicitudController as AdminSolicitudController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogoErpController;
use App\Http\Controllers\Api\DocumentoController;
use App\Http\Controllers\Api\PaginaController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\ReclamacionController;
use App\Http\Controllers\Api\SitioController;
use App\Http\Controllers\Api\SolicitudController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API REST (/api) — respuesta estándar { success, message, data[, pagination] }
|--------------------------------------------------------------------------
| Públicas: el contenido de cada página, solo lectura + los formularios del sitio.
| Login / logout: sesión del navegador (Sanctum SPA) o token para apps.
| Panel (/api/admin): con esa sesión o con el token.
*/

Route::name('api.')->group(function () {
    // Sesión del panel
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1')->name('login');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum')->name('logout');
    Route::get('/sesion', [AuthController::class, 'sesion'])->middleware('throttle:60,1')->name('sesion');

    Route::middleware('throttle:60,1')->group(function () {
        // Todo lo que muestra cada página del sitio en una sola respuesta
        Route::get('/paginas/planes/{slug}', [PaginaController::class, 'plan'])->name('paginas.plan');
        Route::get('/paginas/{pagina}', [PaginaController::class, 'show'])->name('paginas.show');

        Route::get('/sitio', [SitioController::class, 'ajustes'])->name('sitio');
        Route::get('/menu', [SitioController::class, 'menu'])->name('menu');
        Route::get('/secciones', [SitioController::class, 'secciones'])->name('secciones');
        Route::get('/banners', [SitioController::class, 'banners'])->name('banners');
        Route::get('/preguntas', [SitioController::class, 'preguntas'])->name('preguntas');

        Route::get('/planes', [PlanController::class, 'index'])->name('planes.index');
        Route::get('/planes/{slug}', [PlanController::class, 'show'])->name('planes.show');
        Route::get('/documentos', [DocumentoController::class, 'index'])->name('documentos');

        // Copia del ERP (solo campos públicos)
        Route::get('/talleres', [CatalogoErpController::class, 'talleres'])->name('talleres');
        Route::get('/comercios', [CatalogoErpController::class, 'comercios'])->name('comercios');
        Route::get('/cupones', [CatalogoErpController::class, 'cupones'])->name('cupones');
    });

    // Formularios del sitio (con límite para evitar abuso)
    Route::post('/solicitudes', [SolicitudController::class, 'store'])->middleware('throttle:5,1')->name('solicitudes.store');
    Route::post('/reclamaciones', [ReclamacionController::class, 'store'])->middleware('throttle:5,1')->name('reclamaciones.store');
    Route::post('/reclamaciones/consultar', [ReclamacionController::class, 'consultar'])->middleware('throttle:10,1')->name('reclamaciones.consultar');
    // Datos de la constancia: solo con la dirección firmada que da la página de la constancia
    Route::get('/reclamaciones/{reclamacion}/constancia', [ReclamacionController::class, 'constancia'])->middleware('signed')->name('reclamaciones.constancia');
    // Adjunto de una reclamación: solo con la dirección firmada y temporal que el panel da a cada
    // adjunto (así se abre en otra pestaña o en el reproductor, que no llevan la sesión de la API)
    Route::get('/admin/reclamaciones/adjuntos/{adjunto}', [AdminReclamacionController::class, 'adjunto'])
        ->middleware('signed:relative')
        ->name('admin.reclamaciones.adjunto');

    /*
    | Panel administrativo
    */
    Route::middleware('auth:sanctum')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/contadores', [DashboardController::class, 'contadores'])->name('contadores');

        Route::apiResource('banners', AdminBannerController::class);
        Route::apiResource('servicios', ServicioController::class);
        Route::apiResource('documentos', AdminDocumentoController::class);
        Route::apiResource('preguntas', PreguntaFrecuenteController::class)->parameters(['preguntas' => 'pregunta']);

        Route::apiResource('secciones', SeccionController::class)
            ->only(['index', 'show', 'update'])
            ->parameters(['secciones' => 'seccion']);

        Route::get('/cotizador', [OpcionPlanController::class, 'index'])->name('cotizador.index');
        Route::post('/cotizador/opciones/erp', [OpcionPlanController::class, 'importarErp'])->name('cotizador.opciones.erp');
        Route::apiResource('cotizador/opciones', OpcionPlanController::class)
            ->except(['index'])
            ->parameters(['opciones' => 'opcion'])
            ->names('cotizador.opciones');

        Route::controller(AdminSolicitudController::class)->prefix('solicitudes')->name('solicitudes.')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/exportar', 'exportar')->name('exportar');
            Route::get('/{mensaje}', 'show')->name('show');
            Route::put('/{mensaje}/seguimiento', 'seguimiento')->name('seguimiento');
            Route::patch('/{mensaje}/leido', 'leido')->name('leido');
            Route::delete('/{mensaje}', 'destroy')->name('destroy');
        });

        Route::controller(AdminReclamacionController::class)->prefix('reclamaciones')->name('reclamaciones.')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/{reclamacion}', 'show')->name('show');
            Route::put('/{reclamacion}/respuesta', 'responder')->name('responder');
        });

        Route::get('/configuracion', [ConfiguracionController::class, 'show'])->name('configuracion.show');
        Route::put('/configuracion', [ConfiguracionController::class, 'update'])->name('configuracion.update');

        Route::get('/perfil', [PerfilController::class, 'show'])->name('perfil.show');
        Route::put('/perfil', [PerfilController::class, 'update'])->name('perfil.update');
        Route::put('/perfil/password', [PerfilController::class, 'password'])->name('perfil.password');

        Route::get('/erp', [ErpController::class, 'estado'])->name('erp.estado');
        Route::post('/erp/sincronizar', [ErpController::class, 'sincronizar'])->name('erp.sincronizar');
    });
});
