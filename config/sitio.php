<?php

/*
|--------------------------------------------------------------------------
| Configuración del sitio web
|--------------------------------------------------------------------------
|
| Claves editables desde el panel (/admin/configuracion). Estos son los
| valores por defecto: lo guardado en la tabla `configuraciones` los
| reemplaza. Solo se aceptan las claves listadas aquí.
|
*/

return [

    'defaults' => [
        // Empresa
        'empresa_nombre' => 'CrediGo',
        'empresa_razon_social' => '',
        'empresa_ruc' => '',
        'empresa_eslogan' => '',
        'empresa_descripcion' => '',

        // Contacto
        'contacto_telefono' => '',
        'contacto_whatsapp' => '',
        'contacto_whatsapp_mensaje' => 'Hola, quiero información',
        'contacto_email' => '',
        'contacto_direccion' => '',
        'contacto_ciudad' => '',
        'contacto_horario' => '',
        'contacto_mapa_url' => '',

        // Redes sociales
        'redes_facebook' => '',
        'redes_instagram' => '',
        'redes_tiktok' => '',
        'redes_youtube' => '',

        // Apariencia
        'color_primario' => '#0f1037',
        'color_acento' => '#f8ec34',
        'logo' => null,
        'favicon' => null,

        // Avisos internos: correos que reciben las solicitudes y reclamaciones (separados por coma)
        'notificaciones_email' => '',

        // SEO y marketing
        'imagen_compartir' => null, // vista previa al compartir en WhatsApp/Facebook (1200×630)
        'analytics_ga4' => '', // ID de medición de Google Analytics 4 (G-XXXXXXX)
        'analytics_meta_pixel' => '', // ID del píxel de Meta (Facebook/Instagram)
    ],

    // Claves que guardan rutas de imagen (se suben como archivo)
    'imagenes' => ['logo', 'favicon', 'imagen_compartir'],

    // Claves que no se envían al sitio público (solo se ven en el panel)
    'privadas' => ['notificaciones_email'],

];
