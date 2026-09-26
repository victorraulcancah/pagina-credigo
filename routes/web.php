<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

// Guía visual de componentes, solo disponible en desarrollo
if (app()->isLocal()) {
    Route::get('/componentes', function () {
        return Inertia::render('Componentes');
    });
}
