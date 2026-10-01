<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Mantiene al día la copia de los talleres del ERP (así la página no espera al ERP)
Schedule::command('erp:sincronizar')->everyThirtyMinutes()->withoutOverlapping();
