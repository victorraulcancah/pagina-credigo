<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Los Resources salen sin la envoltura { data: ... }: la API ya responde { success, message, data }
        // y las páginas Inertia reciben las listas anidadas (ej. las opciones de un plan) como arreglos.
        JsonResource::withoutWrapping();
    }
}
