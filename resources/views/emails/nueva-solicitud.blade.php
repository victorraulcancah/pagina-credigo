<x-mail::message>
# {{ $mensaje->origen === 'cotizador' ? 'Nueva cotización' : 'Nuevo mensaje' }} desde la web

**{{ $mensaje->nombre_completo }}** escribió el {{ $mensaje->created_at->format('d/m/Y H:i') }}.

<x-mail::panel>
**Celular:** {{ $mensaje->telefono }}<br>
@if ($mensaje->email)
**Correo:** {{ $mensaje->email }}<br>
@endif
@if ($mensaje->tipo_consulta_texto)
**Tipo de consulta:** {{ $mensaje->tipo_consulta_texto }}<br>
@endif
@if ($mensaje->asunto)
**Asunto:** {{ $mensaje->asunto }}<br>
@endif
**Origen:** {{ \App\Models\MensajeContacto::ORIGENES[$mensaje->origen] ?? $mensaje->origen }}
</x-mail::panel>

{{ $mensaje->mensaje }}

<x-mail::button :url="route('admin.mensajes.index')">
Ver en el panel
</x-mail::button>

<small>Responde rápido: los clientes que reciben respuesta el mismo día tienen más probabilidad de inscribirse.</small>
</x-mail::message>
