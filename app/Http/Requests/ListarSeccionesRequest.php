<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** GET /api/secciones?paginas=inicio,general */
class ListarSeccionesRequest extends FormRequest
{
    public const PAGINAS = ['inicio', 'nosotros', 'servicios', 'requisitos', 'pagos', 'talleres', 'beneficios', 'cotizador', 'contacto', 'general', 'legal'];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['paginas' => ['required', 'string', 'max:200']];
    }

    /** Páginas pedidas que existen. */
    public function paginas(): array
    {
        return array_values(array_intersect(array_map('trim', explode(',', $this->validated('paginas'))), self::PAGINAS));
    }
}
