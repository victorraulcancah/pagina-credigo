@php
    $sitio = app(\App\Services\ConfiguracionService::class)->publicas();

    // SEO: los controladores públicos envían el prop `seo` (título, descripción, imagen).
    // Va en el HTML del servidor porque WhatsApp/Facebook/Google no ejecutan el JavaScript.
    $seo = $page['props']['seo'] ?? [];
    $titulo = ! empty($seo['titulo']) ? "{$seo['titulo']} - {$sitio['empresa_nombre']}" : $sitio['empresa_nombre'];
    $descripcion = \Illuminate\Support\Str::limit(trim(preg_replace('/\s+/', ' ', strip_tags($seo['descripcion'] ?? $sitio['empresa_descripcion'] ?? ''))), 160);
    $imagen = $seo['imagen'] ?? $sitio['imagen_compartir_url'] ?? $sitio['logo_url'] ?? asset('images/logos/credigo.png');

    // Panel, login y constancias: no se indexan ni cargan analítica
    $privada = request()->is('admin', 'admin/*', 'login', 'libro-de-reclamaciones/constancia/*');
@endphp
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

    <title inertia>{{ $titulo }}</title>
    @if ($descripcion)
        <meta name="description" content="{{ $descripcion }}" inertia="description">
    @endif

    @if ($privada)
        <meta name="robots" content="noindex, nofollow">
    @else
        <link rel="canonical" href="{{ url()->current() }}">
        {{-- Vista previa al compartir (Panel → Configuración → SEO y marketing) --}}
        <meta property="og:type" content="website">
        <meta property="og:locale" content="es_PE">
        <meta property="og:site_name" content="{{ $sitio['empresa_nombre'] }}">
        <meta property="og:title" content="{{ $titulo }}">
        <meta property="og:description" content="{{ $descripcion }}">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:image" content="{{ $imagen }}">
        <meta name="twitter:card" content="summary_large_image">

        {{-- Analítica: IDs validados en ConfiguracionService (solo formatos permitidos) --}}
        @if ($sitio['analytics_ga4'])
            <script async src="https://www.googletagmanager.com/gtag/js?id={{ $sitio['analytics_ga4'] }}"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag() { dataLayer.push(arguments); }
                gtag('js', new Date());
                gtag('config', '{{ $sitio['analytics_ga4'] }}');
            </script>
        @endif
        @if ($sitio['analytics_meta_pixel'])
            <script>
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '{{ $sitio['analytics_meta_pixel'] }}');
                fbq('track', 'PageView');
            </script>
        @endif
    @endif

    @fonts
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="bg-white antialiased">
    @inertia
</body>
</html>
