<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/** Inicio de sesión del panel. Bloquea tras 5 intentos fallidos por correo + IP. */
class LoginRequest extends FormRequest
{
    private const MAX_INTENTOS = 5;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['boolean'],
            // Solo para apps u otros sistemas (sin sesión del navegador): nombre del token
            'dispositivo' => ['nullable', 'string', 'max:100'],
        ];
    }

    /** @throws ValidationException si se superó el límite de intentos */
    public function verificarIntentos(): void
    {
        if (! RateLimiter::tooManyAttempts($this->claveIntentos(), self::MAX_INTENTOS)) {
            return;
        }

        event(new Lockout($this));

        $segundos = RateLimiter::availableIn($this->claveIntentos());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', ['seconds' => $segundos, 'minutes' => ceil($segundos / 60)]),
        ]);
    }

    /** @throws ValidationException siempre: cuenta el intento y avisa que los datos no coinciden */
    public function rechazar(): never
    {
        RateLimiter::hit($this->claveIntentos());

        throw ValidationException::withMessages(['email' => trans('auth.failed')]);
    }

    public function limpiarIntentos(): void
    {
        RateLimiter::clear($this->claveIntentos());
    }

    private function claveIntentos(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
