@php($sitio = app(\App\Services\ConfiguracionService::class)->publicas())
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="{{ $sitio['color_primario'] }}">
    <link rel="icon" href="{{ $sitio['favicon_url'] ?? asset('favicon.ico') }}">
    {{-- Colores de marca editables desde /admin/configuracion/apariencia (validados como hex) --}}
    <style>:root { --color-primary: {{ $sitio['color_primario'] }}; --color-accent: {{ $sitio['color_acento'] }}; }</style>
    <title inertia>{{ $sitio['empresa_nombre'] }}</title>
    @fonts
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="bg-white antialiased">
    @inertia
</body>
</html>
