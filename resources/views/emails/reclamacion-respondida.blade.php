<x-mail::message>
# Respuesta a tu {{ $reclamacion->tipo }} N° {{ $reclamacion->codigo }}

Hola {{ $reclamacion->nombre }}, esta es nuestra respuesta a la hoja de reclamación que registraste el {{ $reclamacion->created_at->format('d/m/Y') }}.

<x-mail::panel>
{{ $reclamacion->respuesta }}
</x-mail::panel>

**Fecha de respuesta:** {{ $reclamacion->respondido_at->format('d/m/Y H:i') }}

Si tienes alguna consulta adicional, puedes responder a este correo.

{{ $reclamacion->proveedor['razon_social'] ?? config('app.name') }}
</x-mail::message>
