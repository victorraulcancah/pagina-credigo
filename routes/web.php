<?php

use App\Http\Controllers\Admin\AdjuntoReclamacionController;
use App\Http\Controllers\Admin\ExportarSolicitudesController;
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
| Panel administrativo (/admin): solo abre cada pantalla. Sus datos los pide a la API (/api/admin)
| y también guarda y elimina por la API. Las descargas son archivos, no JSON.
*/
Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::inertia('/', 'Admin/Dashboard')->name('dashboard');

    Route::inertia('/configuracion/empresa', 'Admin/Configuracion/Empresa')->name('configuracion.empresa');
    Route::inertia('/configuracion/apariencia', 'Admin/Configuracion/Apariencia')->name('configuracion.apariencia');
    Route::inertia('/configuracion/seo', 'Admin/Configuracion/Seo')->name('configuracion.seo');

    Route::inertia('/banners', 'Admin/Banners/Index')->name('banners.index');
    Route::inertia('/secciones', 'Admin/Secciones/Index')->name('secciones.index');
    Route::get('/secciones/{seccion}/edit', fn (int $seccion) => Inertia::render('Admin/Secciones/Edit', ['seccionId' => $seccion]))
        ->whereNumber('seccion')
        ->name('secciones.edit');
    Route::inertia('/servicios', 'Admin/Servicios/Index')->name('servicios.index');
    Route::inertia('/cotizador', 'Admin/Cotizador/Index')->name('cotizador.index');
    Route::inertia('/preguntas', 'Admin/Preguntas/Index')->name('preguntas.index');
    Route::inertia('/documentos', 'Admin/Documentos/Index')->name('documentos.index');

    Route::inertia('/mensajes', 'Admin/Mensajes/Index')->name('mensajes.index');
    Route::get('/mensajes/exportar', ExportarSolicitudesController::class)->name('mensajes.exportar');

    Route::inertia('/reclamaciones', 'Admin/Reclamaciones/Index')->name('reclamaciones.index');
    Route::get('/reclamaciones/adjuntos/{adjunto}', AdjuntoReclamacionController::class)->name('reclamaciones.adjunto');

    Route::inertia('/perfil', 'Admin/Perfil')->name('perfil.edit');
});

// Guía visual de componentes, solo disponible en desarrollo
if (app()->isLocal()) {
    Route::get('/componentes', fn () => Inertia::render('Componentes'));
}
