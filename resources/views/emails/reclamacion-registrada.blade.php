<x-mail::message>
# Hoja de reclamación N° {{ $reclamacion->codigo }}

Hola {{ $reclamacion->nombre }}, registramos tu **{{ $reclamacion->tipo }}** en nuestro Libro de Reclamaciones el {{ $reclamacion->created_at->format('d/m/Y H:i') }}.
Te responderemos a este correo en un plazo no mayor a **{{ \App\Models\Reclamacion::DIAS_HABILES_RESPUESTA }} días hábiles** (hasta el {{ \Illuminate\Support\Carbon::parse($reclamacion->fecha_limite)->format('d/m/Y') }}).

<x-mail::panel>
**Proveedor:** {{ $reclamacion->proveedor['razon_social'] ?? '' }} — RUC {{ $reclamacion->proveedor['ruc'] ?? '' }}<br>
{{ $reclamacion->proveedor['direccion'] ?? '' }}
</x-mail::panel>

## 1. Consumidor
{{ $reclamacion->nombre }} ({{ $reclamacion->tipo_documento }} {{ $reclamacion->numero_documento }})<br>
{{ $reclamacion->domicilio }}<br>
{{ $reclamacion->telefono }} · {{ $reclamacion->email }}
@if ($reclamacion->menor_de_edad)
<br>**Apoderado:** {{ $reclamacion->apoderado }} ({{ $reclamacion->apoderado_tipo_documento }} {{ $reclamacion->apoderado_numero_documento }})
@endif

## 2. Bien contratado
**{{ ucfirst($reclamacion->tipo_bien) }}:** {{ $reclamacion->descripcion_bien }}<br>
@if ($reclamacion->producto_nombre)
**Producto:** {{ collect([$reclamacion->producto_nombre, $reclamacion->producto_marca, $reclamacion->producto_modelo])->filter()->implode(' · ') }}@if ($reclamacion->producto_codigo) (código {{ $reclamacion->producto_codigo }})@endif<br>
@endif
@if ($reclamacion->comprobante_texto || $reclamacion->comprobante_numero)
**Comprobante:** {{ $reclamacion->comprobante_texto }} {{ $reclamacion->comprobante_numero }}@if ($reclamacion->fecha_compra) — {{ $reclamacion->fecha_compra->format('d/m/Y') }}@endif<br>
@endif
@if ($reclamacion->numero_contrato)
**Código de asociado / contrato:** {{ $reclamacion->numero_contrato }}<br>
@endif
**Monto reclamado:** S/ {{ number_format($reclamacion->monto_reclamado, 2) }}

## 3 y 4. {{ ucfirst($reclamacion->tipo) }}
**Detalle:** {{ $reclamacion->detalle }}

@if ($reclamacion->solucion_texto)
**Solución esperada:** {{ $reclamacion->solucion_texto }}

@endif
**Pedido:** {{ $reclamacion->pedido }}

@if ($reclamacion->adjuntos->isNotEmpty())
**Archivos adjuntos:** {{ $reclamacion->adjuntos->pluck('nombre_original')->implode(', ') }}

@endif
<x-mail::button :url="route('reclamaciones.consultar')">
Consultar el estado de mi reclamo
</x-mail::button>

Para consultarlo usa tu número de hoja (**{{ $reclamacion->codigo }}**) y tu número de documento.

<small>La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.</small>

{{ $reclamacion->proveedor['razon_social'] ?? config('app.name') }}
</x-mail::message>
