<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** /whatsapp?texto=… (botones del panel que abren WhatsApp con un mensaje ya escrito). */
class WhatsappRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['texto' => ['nullable', 'string', 'max:500']];
    }
}
