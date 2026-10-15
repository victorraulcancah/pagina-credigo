<x-mail::message>
# Nueva reserva desde la web

**{{ $reserva->nombre }}** reservó: **{{ $reserva->tipo }}**.

<x-mail::panel>
**Fecha:** {{ $reserva->fecha->format('d/m/Y') }}{{ $reserva->hora ? ' a las '.$reserva->hora : '' }}<br>
@if ($reserva->origen)
**Desde:** {{ $reserva->origen }}<br>
@endif
@if ($reserva->destino)
**Hasta:** {{ $reserva->destino }}<br>
@endif
@if ($reserva->pasajeros)
**Pasajeros:** {{ $reserva->pasajeros }}<br>
@endif
**Celular:** {{ $reserva->telefono }}
</x-mail::panel>

@if ($reserva->comentario)
{{ $reserva->comentario }}
@endif

<x-mail::button :url="route('admin.reservas.index')">
Ver en el panel
</x-mail::button>

<small>Confírmale por WhatsApp y marca la reserva como confirmada en el panel.</small>
</x-mail::message>
