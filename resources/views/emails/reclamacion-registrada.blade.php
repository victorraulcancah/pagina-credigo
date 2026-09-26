<x-mail::message>
# Hoja de reclamación N° {{ $reclamacion->codigo }}

Hola {{ $reclamacion->nombre }}, registramos tu **{{ $reclamacion->tipo }}** en nuestro Libro de Reclamaciones el {{ $reclamacion->created_at->format('d/m/Y H:i') }}.
Te responderemos a este correo en un plazo no mayor a **{{ \App\Models\Reclamacion::DIAS_HABILES_RESPUESTA }} días hábiles** (hasta el {{ \Illuminate\Support\Carbon::parse($reclamacion->fecha_limite)->format('d/m/Y') }}).

<x-mail::panel>
**Proveedor:** {{ $reclamacion->proveedor['razon_social'] ?? '' }} — RUC {{ $reclamacion->proveedor['ruc'] ?? '' }}<br>
{{ $reclamacion->proveedor['direccion'] ?? '' }}
</x-mail::panel>

**Consumidor:** {{ $reclamacion->nombre }} ({{ $reclamacion->tipo_documento }} {{ $reclamacion->numero_documento }})<br>
@if ($reclamacion->menor_de_edad)
**Padre, madre o tutor:** {{ $reclamacion->apoderado }}<br>
@endif
**Domicilio:** {{ $reclamacion->domicilio }}<br>
**Teléfono:** {{ $reclamacion->telefono }} · **Correo:** {{ $reclamacion->email }}

**{{ ucfirst($reclamacion->tipo_bien) }} contratado:** {{ $reclamacion->descripcion_bien }}<br>
@if ($reclamacion->monto_reclamado)
**Monto reclamado:** S/ {{ number_format($reclamacion->monto_reclamado, 2) }}<br>
@endif

**Detalle:** {{ $reclamacion->detalle }}

**Pedido:** {{ $reclamacion->pedido }}

<small>La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.</small>

{{ $reclamacion->proveedor['razon_social'] ?? config('app.name') }}
</x-mail::message>
