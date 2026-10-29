<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SedeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ciudad' => ['required', 'string', 'max:80'],
            'nombre' => ['nullable', 'string', 'max:100'],
            'direccion' => ['required', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'horario' => ['nullable', 'string', 'max:150'],
            // Enlace para abrir en Google Maps (solo http/https: nunca javascript:)
            'mapa_url' => ['nullable', 'url:http,https', 'max:500'],
            'orden' => ['required', 'integer', 'min:0'],
            'activo' => ['boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'ciudad' => 'ciudad',
            'nombre' => 'nombre de la sede',
            'direccion' => 'dirección',
            'telefono' => 'teléfono',
            'mapa_url' => 'enlace del mapa',
        ];
    }

    public function messages(): array
    {
        return ['mapa_url.url' => 'Pega el enlace completo del mapa (empieza con https://).'];
    }
}
