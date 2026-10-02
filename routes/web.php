<?php

use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\ConfiguracionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DocumentoController;
use App\Http\Controllers\Admin\MensajeContactoController;
use App\Http\Controllers\Admin\OpcionPlanController;
use App\Http\Controllers\Admin\PerfilController;
use App\Http\Controllers\Admin\PreguntaFrecuenteController;
use App\Http\Controllers\Admin\ReclamacionController;
use App\Http\Controllers\Admin\SeccionController;
use App\Http\Controllers\Admin\ServicioController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Web\LibroReclamacionesController;
use App\Http\Controllers\Web\PaginaController;
use App\Http\Controllers\Web\SeoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Rutas web: solo páginas (Inertia) y descargas.
| Todo lo que guarda o borra va por la API REST (routes/api.php).
|--------------------------------------------------------------------------
*/

/*
| Sitio público (los datos llegan desde el servidor: Google y WhatsApp leen el título y la imagen)
*/
Route::controller(PaginaController::class)->group(function () {
    Route::get('/', 'inicio')->name('inicio');
    Route::get('/nosotros', 'nosotros')->name('nosotros');
    Route::get('/servicios', 'servicios')->name('servicios');
    Route::get('/servicios/{slug}', 'plan')->name('plan');
    Route::get('/requisitos', 'requisitos')->name('requisitos');
    Route::get('/como-pagar', 'pagos')->name('pagos');
    Route::get('/talleres', 'talleres')->name('talleres');
    Route::get('/beneficios', 'beneficios')->name('beneficios');
    Route::get('/soporte', 'contacto')->name('soporte');
    Route::get('/cotizador', 'cotizador')->name('cotizador');
    Route::get('/terminos-y-condiciones', 'terminos')->name('terminos');
    Route::get('/politica-de-privacidad', 'privacidad')->name('privacidad');
});

// La página de contacto ahora se llama Soporte
Route::permanentRedirect('/contacto', '/soporte');

Route::get('/sitemap.xml', [SeoController::class, 'sitemap'])->name('sitemap');
Route::get('/robots.txt', [SeoController::class, 'robots'])->name('robots');

// Libro de Reclamaciones virtual (Indecopi): registrar y consultar van por la API
Route::controller(LibroReclamacionesController::class)->prefix('libro-de-reclamaciones')->name('reclamaciones.')->group(function () {
    Route::get('/', 'create')->name('create');
    Route::get('/constancia/{reclamacion}', 'constancia')->middleware('signed')->name('constancia');
    Route::get('/consultar', 'consultar')->name('consultar');
});

/*
| Autenticación del panel (sesión: la misma que usa la API del panel)
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->name('login.store');
});

Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

/*
| Panel administrativo (/admin): pantallas. Guardan y eliminan con la API (/api/admin).
*/
Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');

    Route::get('/configuracion/empresa', [ConfiguracionController::class, 'empresa'])->name('configuracion.empresa');
    Route::get('/configuracion/apariencia', [ConfiguracionController::class, 'apariencia'])->name('configuracion.apariencia');
    Route::get('/configuracion/seo', [ConfiguracionController::class, 'seo'])->name('configuracion.seo');

    Route::get('/banners', [BannerController::class, 'index'])->name('banners.index');
    Route::get('/secciones', [SeccionController::class, 'index'])->name('secciones.index');
    Route::get('/secciones/{seccion}/edit', [SeccionController::class, 'edit'])->name('secciones.edit');
    Route::get('/servicios', [ServicioController::class, 'index'])->name('servicios.index');
    Route::get('/cotizador', [OpcionPlanController::class, 'index'])->name('cotizador.index');
    Route::get('/preguntas', [PreguntaFrecuenteController::class, 'index'])->name('preguntas.index');
    Route::get('/documentos', [DocumentoController::class, 'index'])->name('documentos.index');

    Route::get('/mensajes', [MensajeContactoController::class, 'index'])->name('mensajes.index');
    Route::get('/mensajes/exportar', [MensajeContactoController::class, 'exportar'])->name('mensajes.exportar');

    Route::get('/reclamaciones', [ReclamacionController::class, 'index'])->name('reclamaciones.index');
    Route::get('/reclamaciones/adjuntos/{adjunto}', [ReclamacionController::class, 'adjunto'])->name('reclamaciones.adjunto');

    Route::get('/perfil', [PerfilController::class, 'edit'])->name('perfil.edit');
});

// Guía visual de componentes, solo disponible en desarrollo
if (app()->isLocal()) {
    Route::get('/componentes', fn () => Inertia::render('Componentes'));
}
