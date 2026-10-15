<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** Resumen de visitas: cuántos días trae la serie (por defecto 30). */
class VisitasRequest extends FormRequest
{
    public const DIAS_POR_DEFECTO = 30;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dias' => ['sometimes', 'integer', 'min:7', 'max:90'],
        ];
    }

    public function dias(): int
    {
        return (int) ($this->validated('dias') ?? self::DIAS_POR_DEFECTO);
    }
}
