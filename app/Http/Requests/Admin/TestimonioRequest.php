<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TestimonioRequest extends FormRequest
{
    // Tope de un video subido (el servidor lo permite en public/.user.ini)
    public const VIDEO_MAX_MB = 100;

    public function authorize(): bool
    {
        return true;
    }

    /** Un enlace corto de TikTok (botón "Compartir" del celular) se completa antes de validar. */
    protected function prepareForValidation(): void
    {
        VideoRegla::completar($this);
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:80'],
            'ciudad' => ['nullable', 'string', 'max:60'],
            'comentario' => ['required', 'string', 'max:400'],
            'foto' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'quitar_foto' => ['boolean'],
            'foto_vehiculo' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'quitar_foto_vehiculo' => ['boolean'],
            'vehiculo' => ['nullable', 'string', 'max:80'],
            'calificacion' => ['nullable', 'integer', 'between:1,5'],
            'video_url' => VideoRegla::reglas(),
            // O el video subido (del celular o la PC). MP4 se ve en todos los navegadores
            'video' => ['nullable', 'file', 'mimetypes:video/mp4,video/quicktime,video/webm', 'max:'.(self::VIDEO_MAX_MB * 1024)],
            'quitar_video' => ['boolean'],
            // Su nombre, foto y comentario son datos personales: sin su autorización no se publica
            'autorizado' => ['boolean', Rule::when($this->boolean('activo'), ['accepted'])],
            'orden' => ['required', 'integer', 'min:0'],
            'activo' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            ...VideoRegla::mensajes('video_url'),
            'video.mimetypes' => 'El video debe ser MP4, MOV o WEBM.',
            'video.max' => 'El video no puede pesar más de '.self::VIDEO_MAX_MB.' MB.',
            'autorizado.accepted' => 'Para publicarlo necesitas la autorización del conductor. Si aún no la tienes, guárdalo como oculto.',
        ];
    }

    public function attributes(): array
    {
        return [
            'foto' => 'foto del conductor',
            'foto_vehiculo' => 'foto del vehículo',
            'video' => 'video',
            'calificacion' => 'calificación',
        ];
    }
}
