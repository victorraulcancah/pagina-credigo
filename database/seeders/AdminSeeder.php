<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/** Crea el usuario administrador del panel con los datos de ADMIN_* del .env. */
class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if (! $email || ! $password) {
            $this->command?->warn('AdminSeeder: define ADMIN_EMAIL y ADMIN_PASSWORD en el .env para crear el administrador.');

            return;
        }

        User::firstOrCreate(
            ['email' => $email],
            ['name' => env('ADMIN_NAME', 'Administrador'), 'password' => $password],
        );
    }
}
