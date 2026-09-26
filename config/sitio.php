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
    ],

    // Claves que guardan rutas de imagen (se suben como archivo)
    'imagenes' => ['logo', 'favicon'],

];
