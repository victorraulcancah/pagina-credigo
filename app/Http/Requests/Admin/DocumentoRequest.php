<?php

namespace App\Http\Requests\Admin;

use App\Models\Documento;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DocumentoRequest extends FormRequest
{
    public const MAX_MB = 10;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string', 'max:300'],
            'categoria' => ['required', Rule::in(array_keys(Documento::CATEGORIAS))],
            // El plan solo aplica a las fichas de planes
            'servicio_id' => ['nullable', Rule::excludeIf(fn () => $this->input('categoria') !== 'planes'), 'integer', 'exists:servicios,id'],
            // Al crear el PDF es obligatorio; al editar, solo si se reemplaza
            'archivo' => [Rule::requiredIf(fn () => ! $this->route('documento')), 'nullable', 'file', 'mimes:pdf', 'max:'.(self::MAX_MB * 1024)],
            'orden' => ['required', 'integer', 'min:0'],
            'activo' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'archivo.required' => 'Elige el archivo PDF.',
            'archivo.mimes' => 'El archivo debe ser un PDF.',
            'archivo.max' => 'El PDF no puede pesar más de '.self::MAX_MB.' MB.',
        ];
    }

    public function attributes(): array
    {
        return ['servicio_id' => 'plan', 'archivo' => 'archivo PDF'];
    }

    /** Datos a guardar (el archivo lo resuelve el controlador). */
    public function datos(): array
    {
        return [
            ...$this->safe()->except(['archivo', 'servicio_id']),
            'servicio_id' => $this->input('categoria') === 'planes' ? $this->validated('servicio_id') : null,
        ];
    }
}
