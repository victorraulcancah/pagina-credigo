<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Valida los ajustes del sitio. Se usa desde dos pantallas (Empresa y
 * Apariencia), por eso cada campo es `sometimes`: solo se valida si viene.
 */
class ConfiguracionRequest extends FormRequest
{
    private const COLOR_HEX = 'regex:/^#[0-9a-fA-F]{6}$/';

    public function authorize(): bool
    {
        return true;
    }

    /** Si pegan el <iframe> completo de Google Maps, se extrae solo el src. */
    protected function prepareForValidation(): void
    {
        if ($this->filled('analytics_ga4')) {
            $this->merge(['analytics_ga4' => strtoupper(trim((string) $this->input('analytics_ga4')))]);
        }

        $mapa = $this->input('contacto_mapa_url');

        if ($mapa && str_contains($mapa, '<iframe') && preg_match('/src="([^"]+)"/', $mapa, $coincidencia)) {
            $this->merge(['contacto_mapa_url' => html_entity_decode($coincidencia[1])]);
        }
    }

    public function rules(): array
    {
        return [
            'empresa_nombre' => ['sometimes', 'required', 'string', 'max:100'],
            'empresa_razon_social' => ['sometimes', 'nullable', 'string', 'max:150'],
            'empresa_ruc' => ['sometimes', 'nullable', 'digits:11'],
            'empresa_eslogan' => ['sometimes', 'nullable', 'string', 'max:150'],
            'empresa_descripcion' => ['sometimes', 'nullable', 'string', 'max:500'],

            'contacto_telefono' => ['sometimes', 'nullable', 'string', 'max:30'],
            'contacto_whatsapp' => ['sometimes', 'nullable', 'regex:/^[0-9]{9,15}$/'],
            'contacto_whatsapp_mensaje' => ['sometimes', 'nullable', 'string', 'max:200'],
            'contacto_email' => ['sometimes', 'nullable', 'email', 'max:150'],
            'contacto_direccion' => ['sometimes', 'nullable', 'string', 'max:255'],
            'contacto_ciudad' => ['sometimes', 'nullable', 'string', 'max:150'],
            'contacto_horario' => ['sometimes', 'nullable', 'string', 'max:150'],
            'contacto_mapa_url' => ['sometimes', 'nullable', 'url', 'max:2000', 'starts_with:https://www.google.com/maps/embed'],

            'redes_facebook' => ['sometimes', 'nullable', 'url', 'max:255'],
            'redes_instagram' => ['sometimes', 'nullable', 'url', 'max:255'],
            'redes_tiktok' => ['sometimes', 'nullable', 'url', 'max:255'],
            'redes_youtube' => ['sometimes', 'nullable', 'url', 'max:255'],

            'color_primario' => ['sometimes', 'required', self::COLOR_HEX],
            'color_acento' => ['sometimes', 'required', self::COLOR_HEX],
            'logo' => ['sometimes', 'nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
            'logo_empresa' => ['sometimes', 'nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
            'favicon' => ['sometimes', 'nullable', 'file', 'mimes:png,ico,webp', 'max:512'],
            'quitar_logo' => ['sometimes', 'boolean'],
            'quitar_logo_empresa' => ['sometimes', 'boolean'],
            'quitar_favicon' => ['sometimes', 'boolean'],

            // Correos separados por coma: cada uno debe ser válido
            'notificaciones_email' => ['sometimes', 'nullable', 'string', 'max:500', function ($atributo, $valor, $fallar) {
                $correos = preg_split('/[\s,;]+/', (string) $valor, -1, PREG_SPLIT_NO_EMPTY);
                $invalidos = array_filter($correos, fn ($correo) => ! filter_var($correo, FILTER_VALIDATE_EMAIL));
                if ($invalidos) {
                    $fallar('Correo no válido: '.implode(', ', $invalidos));
                }
            }],

            'imagen_compartir' => ['sometimes', 'nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
            'quitar_imagen_compartir' => ['sometimes', 'boolean'],
            'analytics_ga4' => ['sometimes', 'nullable', 'regex:/^G-[A-Z0-9]{4,20}$/'],
            'analytics_meta_pixel' => ['sometimes', 'nullable', 'regex:/^\d{10,20}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'analytics_ga4.regex' => 'El ID de Google Analytics tiene el formato G-XXXXXXXXXX.',
            'analytics_meta_pixel.regex' => 'El ID del píxel de Meta son solo números (ej. 123456789012345).',
            'contacto_whatsapp.regex' => 'El WhatsApp debe tener solo números con código de país (ej. 51987654321).',
            'contacto_mapa_url.starts_with' => 'Pega el enlace "Insertar un mapa" de Google Maps.',
            'color_primario.regex' => 'El color debe tener formato hexadecimal (ej. #0f1037).',
            'color_acento.regex' => 'El color debe tener formato hexadecimal (ej. #f8ec34).',
        ];
    }

    public function attributes(): array
    {
        return [
            'empresa_nombre' => 'nombre comercial',
            'empresa_razon_social' => 'razón social',
            'empresa_ruc' => 'RUC',
            'empresa_eslogan' => 'eslogan',
            'empresa_descripcion' => 'descripción',
            'contacto_telefono' => 'teléfono',
            'contacto_whatsapp' => 'WhatsApp',
            'contacto_whatsapp_mensaje' => 'mensaje de WhatsApp',
            'contacto_email' => 'correo',
            'contacto_direccion' => 'dirección',
            'contacto_ciudad' => 'ciudad',
            'contacto_horario' => 'horario',
            'contacto_mapa_url' => 'mapa',
            'redes_facebook' => 'Facebook',
            'redes_instagram' => 'Instagram',
            'redes_tiktok' => 'TikTok',
            'redes_youtube' => 'YouTube',
            'color_primario' => 'color principal',
            'color_acento' => 'color de acento',
            'notificaciones_email' => 'correos de avisos',
            'imagen_compartir' => 'imagen para compartir',
            'logo_empresa' => 'logo de la empresa',
        ];
    }
}
