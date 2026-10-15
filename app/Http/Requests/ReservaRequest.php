<?php

namespace App\Http\Requests;

use App\Models\TipoReserva;
use App\Services\ReservaService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Formulario público de reserva (/reservar). Origen, destino y pasajeros solo si el tipo los pide. */
class ReservaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $pideRuta = (bool) TipoReserva::activo()->whereKey($this->integer('tipo_reserva_id'))->value('pide_ruta');

        return [
            'tipo_reserva_id' => ['required', 'integer', Rule::exists('tipos_reserva', 'id')->where('activo', true)],
            'origen' => [Rule::requiredIf($pideRuta), 'nullable', 'string', 'max:150'],
            'destino' => [Rule::requiredIf($pideRuta), 'nullable', 'string', 'max:150'],
            // Desde hoy (hora de Perú)
            'fecha' => ['required', 'date_format:Y-m-d', 'after_or_equal:'.now(ReservaService::ZONA)->toDateString()],
            'hora' => ['nullable', 'date_format:H:i'],
            'pasajeros' => ['nullable', 'integer', 'between:1,50'],
            'nombre' => ['required', 'string', 'max:100'],
            'telefono' => ['required', 'string', 'regex:/^\+?[0-9\s]{6,20}$/'],
            'comentario' => ['nullable', 'string', 'max:1000'],
            // Campo trampa para bots: los humanos no lo ven, debe llegar vacío
            'website' => ['nullable', 'string'],
            // Consentimiento para tratar sus datos (Ley N° 29733)
            'acepta_politica' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'tipo_reserva_id.required' => 'Elige qué quieres reservar.',
            'tipo_reserva_id.exists' => 'Esa opción ya no está disponible. Elige otra.',
            'fecha.after_or_equal' => 'La fecha no puede ser anterior a hoy.',
            'acepta_politica.accepted' => 'Debes aceptar la política de privacidad para enviar tu reserva.',
        ];
    }

    public function attributes(): array
    {
        return [
            'tipo_reserva_id' => 'tipo de reserva',
            'origen' => 'punto de partida',
            'destino' => 'destino',
            'telefono' => 'celular',
        ];
    }
}
