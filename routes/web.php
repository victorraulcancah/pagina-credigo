<?php

use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\ConfiguracionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MensajeContactoController;
use App\Http\Controllers\Admin\PerfilController;
use App\Http\Controllers\Admin\PreguntaFrecuenteController;
use App\Http\Controllers\Admin\SeccionController;
use App\Http\Controllers\Admin\ServicioController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Web\ContactoController;
use App\Http\Controllers\Web\PaginaController;
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
});

Route::post('/contacto', [ContactoController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('contacto.store');

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
    Route::put('/configuracion', [ConfiguracionController::class, 'update'])->name('configuracion.update');

    Route::resource('banners', BannerController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('secciones', SeccionController::class)
        ->only(['index', 'edit', 'update'])
        ->parameters(['secciones' => 'seccion']);

    Route::resource('servicios', ServicioController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->parameters(['servicios' => 'servicio']);

    Route::resource('preguntas', PreguntaFrecuenteController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->parameters(['preguntas' => 'pregunta']);

    Route::get('/mensajes', [MensajeContactoController::class, 'index'])->name('mensajes.index');
    Route::patch('/mensajes/{mensaje}/leido', [MensajeContactoController::class, 'leido'])->name('mensajes.leido');
    Route::delete('/mensajes/{mensaje}', [MensajeContactoController::class, 'destroy'])->name('mensajes.destroy');

    Route::get('/perfil', [PerfilController::class, 'edit'])->name('perfil.edit');
    Route::put('/perfil', [PerfilController::class, 'update'])->name('perfil.update');
    Route::put('/perfil/password', [PerfilController::class, 'password'])->name('perfil.password');
});

// Guía visual de componentes, solo disponible en desarrollo
if (app()->isLocal()) {
    Route::get('/componentes', fn () => Inertia::render('Componentes'));
}
