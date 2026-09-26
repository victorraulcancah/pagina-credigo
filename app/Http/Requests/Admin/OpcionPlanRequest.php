<?php

namespace App\Http\Requests\Admin;

use App\Models\OpcionPlan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OpcionPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'servicio_id' => ['required', 'exists:servicios,id'],
            'nombre' => ['required', 'string', 'max:120'],
            'nota' => ['nullable', 'string', 'max:255'],
            'moneda' => ['required', Rule::in(OpcionPlan::MONEDAS)],
            'inicial' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'cuota' => ['nullable', 'numeric', 'min:0', 'max:99999999', 'required_with:numero_cuotas'],
            'numero_cuotas' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'frecuencia' => ['required', Rule::in(OpcionPlan::FRECUENCIAS)],
            'orden' => ['required', 'integer', 'min:0'],
            'activo' => ['boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'servicio_id' => 'plan',
            'nota' => 'nota',
            'inicial' => 'inicial o inscripción',
            'cuota' => 'monto de la cuota',
            'numero_cuotas' => 'número de cuotas',
        ];
    }
}
