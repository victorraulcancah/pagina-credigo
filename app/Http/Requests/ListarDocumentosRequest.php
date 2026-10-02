<?php

namespace App\Http\Requests;

use App\Models\Documento;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** GET /api/documentos?categoria=requisitos[&servicio_id=3] */
class ListarDocumentosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'categoria' => ['required', Rule::in(array_keys(Documento::CATEGORIAS))],
            'servicio_id' => ['nullable', 'integer'],
        ];
    }
}
