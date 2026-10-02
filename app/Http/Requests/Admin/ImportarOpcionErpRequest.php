<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/** Agregar al cotizador una opción con los precios del ERP ("v12" = variante, "b4" = beneficio). */
class ImportarOpcionErpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'servicio_id' => ['required', 'exists:servicios,id'],
            'erp_ref' => ['required', 'string', 'regex:/^[bv]\d+$/'],
        ];
    }

    public function attributes(): array
    {
        return ['servicio_id' => 'plan'];
    }
}
