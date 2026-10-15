<?php

use App\Services\VisitaService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Mantiene al día la copia de los talleres del ERP (así la página no espera al ERP)
Schedule::command('erp:sincronizar')->everyThirtyMinutes()->withoutOverlapping();

// El contador de visitas solo necesita las huellas del día en curso: las anteriores se borran
Schedule::call(fn () => app(VisitaService::class)->limpiarHuellas())->name('visitas:limpiar-huellas')->dailyAt('08:30');
