<?php

namespace App\Http\Requests;

use App\Models\Reclamacion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReclamacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** Celular y documentos sin espacios (el usuario suele escribir "987 654 321"). */
    protected function prepareForValidation(): void
    {
        $this->merge(array_filter([
            'telefono' => $this->sinEspacios('telefono'),
            'numero_documento' => $this->sinEspacios('numero_documento', mayusculas: true),
            'apoderado_numero_documento' => $this->sinEspacios('apoderado_numero_documento', mayusculas: true),
        ], fn ($valor) => $valor !== null));
    }

    public function rules(): array
    {
        $esMenor = $this->boolean('menor_de_edad');

        return [
            // 1. Consumidor
            'nombre' => ['required', 'string', 'max:150'],
            'tipo_documento' => ['required', Rule::in(Reclamacion::TIPOS_DOCUMENTO)],
            'numero_documento' => ['required', 'string', ...$this->reglasDocumento($this->input('tipo_documento'))],
            'telefono' => ['required', 'regex:/^9\d{8}$/'],
            'email' => ['required', 'email', 'max:150'],
            'domicilio' => ['required', 'string', 'max:255'],
            'menor_de_edad' => ['boolean'],
            'apoderado' => [Rule::requiredIf($esMenor), 'nullable', 'string', 'max:150'],
            'apoderado_tipo_documento' => [Rule::requiredIf($esMenor), 'nullable', Rule::in(Reclamacion::TIPOS_DOCUMENTO)],
            'apoderado_numero_documento' => [
                Rule::requiredIf($esMenor), 'nullable', 'string',
                ...$this->reglasDocumento($this->input('apoderado_tipo_documento')),
            ],

            // 2. Información de la compra (opcional salvo tipo de bien, monto y descripción)
            'comprobante_tipo' => ['nullable', Rule::in(array_keys(Reclamacion::TIPOS_COMPROBANTE))],
            'comprobante_numero' => ['nullable', 'string', 'max:30'],
            'fecha_compra' => ['nullable', 'date', 'before_or_equal:today'],
            'numero_contrato' => ['nullable', 'string', 'max:30'],
            'producto_codigo' => ['nullable', 'string', 'max:50'],
            'producto_nombre' => ['nullable', 'string', 'max:150'],
            'producto_marca' => ['nullable', 'string', 'max:80'],
            'producto_modelo' => ['nullable', 'string', 'max:80'],
            'tipo_bien' => ['required', Rule::in(Reclamacion::TIPOS_BIEN)],
            'monto_reclamado' => ['required', 'numeric', 'min:0', 'max:9999999'],
            'descripcion_bien' => ['required', 'string', 'max:1000'],

            // 3 y 4. Tipo y detalle
            'tipo' => ['required', Rule::in(Reclamacion::TIPOS)],
            'detalle' => ['required', 'string', 'min:20', 'max:3000'],
            'solucion_esperada' => ['nullable', Rule::in(array_keys(Reclamacion::SOLUCIONES))],
            'solucion_otra' => ['nullable', 'string', 'max:255', 'required_if:solucion_esperada,otra'],
            'pedido' => ['required', 'string', 'min:10', 'max:2000'],

            // 5. Adjuntos (opcionales)
            'fotos' => ['nullable', 'array', 'max:5'],
            'fotos.*' => ['image', 'mimes:jpg,jpeg,png', 'max:5120'],
            'comprobante_archivo' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'video' => ['nullable', 'file', 'mimetypes:video/mp4', 'max:20480'],

            // 6. Confirmaciones
            'declara_veracidad' => ['accepted'],
            'acepta_politica' => ['accepted'],
            'conforme' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'telefono.regex' => 'El teléfono debe ser un celular de 9 dígitos que empiece en 9.',
            'numero_documento.digits' => 'El :attribute debe tener :digits dígitos.',
            'solucion_otra.required_if' => 'Especifica la solución que esperas.',
            'fotos.max' => 'Puedes adjuntar hasta :max fotografías.',
            'fotos.*.max' => 'Cada fotografía debe pesar como máximo 5 MB.',
            'fotos.*.mimes' => 'Las fotografías deben ser JPG o PNG.',
            'comprobante_archivo.max' => 'La factura o comprobante debe pesar como máximo 5 MB.',
            'video.max' => 'El video debe pesar como máximo 20 MB.',
            'video.mimetypes' => 'El video debe estar en formato MP4.',
            'declara_veracidad.accepted' => 'Debes declarar que la información es verdadera.',
            'acepta_politica.accepted' => 'Debes aceptar el tratamiento de tus datos personales.',
            'conforme.accepted' => 'Debes confirmar que estás conforme con el contenido de tu reclamo.',
        ];
    }

    public function attributes(): array
    {
        return [
            'tipo' => 'tipo de registro',
            'nombre' => 'nombres y apellidos',
            'tipo_documento' => 'tipo de documento',
            'numero_documento' => 'número de documento',
            'domicilio' => 'dirección',
            'telefono' => 'teléfono',
            'apoderado' => 'nombre del apoderado',
            'apoderado_tipo_documento' => 'tipo de documento del apoderado',
            'apoderado_numero_documento' => 'documento del apoderado',
            'comprobante_numero' => 'número de comprobante',
            'fecha_compra' => 'fecha de compra',
            'tipo_bien' => 'tipo de bien',
            'monto_reclamado' => 'monto reclamado',
            'descripcion_bien' => 'descripción del producto o servicio',
            'detalle' => 'detalle del reclamo o queja',
            'pedido' => 'pedido concreto',
        ];
    }

    /** Datos a guardar (sin archivos; la aceptación de la política se guarda como acepta_datos). */
    public function datos(): array
    {
        return [
            ...$this->safe()->except(['fotos', 'comprobante_archivo', 'video', 'acepta_politica']),
            'acepta_datos' => true,
        ];
    }

    /** Archivos agrupados por tipo de adjunto. */
    public function archivos(): array
    {
        return [
            'foto' => $this->file('fotos', []),
            'comprobante' => array_filter([$this->file('comprobante_archivo')]),
            'video' => array_filter([$this->file('video')]),
        ];
    }

    private function reglasDocumento(?string $tipo): array
    {
        return match ($tipo) {
            'DNI' => ['digits:8'],
            'RUC' => ['digits:11'],
            default => ['alpha_num', 'max:12'],
        };
    }

    private function sinEspacios(string $campo, bool $mayusculas = false): ?string
    {
        $valor = $this->input($campo);

        if (! is_string($valor)) {
            return null;
        }

        $valor = preg_replace('/\s+/', '', $valor);

        return $mayusculas ? strtoupper($valor) : $valor;
    }
}
