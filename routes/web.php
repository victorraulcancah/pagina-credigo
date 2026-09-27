<?php

use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\ConfiguracionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MensajeContactoController;
use App\Http\Controllers\Admin\OpcionPlanController;
use App\Http\Controllers\Admin\PerfilController;
use App\Http\Controllers\Admin\PreguntaFrecuenteController;
use App\Http\Controllers\Admin\SeccionController;
use App\Http\Controllers\Admin\ServicioController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Admin\ReclamacionController;
use App\Http\Controllers\Web\ContactoController;
use App\Http\Controllers\Web\LibroReclamacionesController;
use App\Http\Controllers\Web\PaginaController;
use App\Http\Controllers\Web\SeoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Sitio público
|--------------------------------------------------------------------------
*/
Route::controller(PaginaController::class)->group(function () {
    Route::get('/', 'inicio')->name('inicio');
    Route::get('/nosotros', 'nosotros')->name('nosotros');
    Route::get('/servicios', 'servicios')->name('servicios');
    Route::get('/contacto', 'contacto')->name('contacto');
    Route::get('/cotizador', 'cotizador')->name('cotizador');
    Route::get('/terminos-y-condiciones', 'terminos')->name('terminos');
    Route::get('/politica-de-privacidad', 'privacidad')->name('privacidad');
});

Route::get('/sitemap.xml', [SeoController::class, 'sitemap'])->name('sitemap');
Route::get('/robots.txt', [SeoController::class, 'robots'])->name('robots');

Route::post('/contacto', [ContactoController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('contacto.store');

// Libro de Reclamaciones virtual (Indecopi)
Route::controller(LibroReclamacionesController::class)->prefix('libro-de-reclamaciones')->name('reclamaciones.')->group(function () {
    Route::get('/', 'create')->name('create');
    Route::post('/', 'store')->middleware('throttle:5,1')->name('store');
    Route::get('/constancia/{reclamacion}', 'constancia')->middleware('signed')->name('constancia');
});

/*
|--------------------------------------------------------------------------
| Autenticación del panel
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->name('login.store');
});

Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

/*
|--------------------------------------------------------------------------
| Panel administrativo (/admin)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');

    Route::get('/configuracion/empresa', [ConfiguracionController::class, 'empresa'])->name('configuracion.empresa');
    Route::get('/configuracion/apariencia', [ConfiguracionController::class, 'apariencia'])->name('configuracion.apariencia');
    Route::get('/configuracion/seo', [ConfiguracionController::class, 'seo'])->name('configuracion.seo');
    Route::put('/configuracion', [ConfiguracionController::class, 'update'])->name('configuracion.update');

    Route::resource('banners', BannerController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('secciones', SeccionController::class)
        ->only(['index', 'edit', 'update'])
        ->parameters(['secciones' => 'seccion']);

    Route::resource('servicios', ServicioController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->parameters(['servicios' => 'servicio']);

    Route::get('/cotizador', [OpcionPlanController::class, 'index'])->name('cotizador.index');
    Route::resource('cotizador/opciones', OpcionPlanController::class)
        ->only(['store', 'update', 'destroy'])
        ->parameters(['opciones' => 'opcion'])
        ->names('cotizador.opciones');

    Route::resource('preguntas', PreguntaFrecuenteController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->parameters(['preguntas' => 'pregunta']);

    Route::get('/mensajes', [MensajeContactoController::class, 'index'])->name('mensajes.index');
    Route::get('/mensajes/exportar', [MensajeContactoController::class, 'exportar'])->name('mensajes.exportar');
    Route::put('/mensajes/{mensaje}/seguimiento', [MensajeContactoController::class, 'seguimiento'])->name('mensajes.seguimiento');
    Route::patch('/mensajes/{mensaje}/leido', [MensajeContactoController::class, 'leido'])->name('mensajes.leido');
    Route::delete('/mensajes/{mensaje}', [MensajeContactoController::class, 'destroy'])->name('mensajes.destroy');

    Route::get('/reclamaciones', [ReclamacionController::class, 'index'])->name('reclamaciones.index');
    Route::put('/reclamaciones/{reclamacion}/respuesta', [ReclamacionController::class, 'responder'])->name('reclamaciones.responder');
    Route::get('/reclamaciones/adjuntos/{adjunto}', [ReclamacionController::class, 'adjunto'])->name('reclamaciones.adjunto');

    Route::get('/perfil', [PerfilController::class, 'edit'])->name('perfil.edit');
    Route::put('/perfil', [PerfilController::class, 'update'])->name('perfil.update');
    Route::put('/perfil/password', [PerfilController::class, 'password'])->name('perfil.password');
});

// Guía visual de componentes, solo disponible en desarrollo
if (app()->isLocal()) {
    Route::get('/componentes', fn () => Inertia::render('Componentes'));
}
