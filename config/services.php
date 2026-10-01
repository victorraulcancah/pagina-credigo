<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    // ERP de CrediGo: la web solo LEE su catálogo público (talleres, etc.) y guarda una copia.
    // Sin ERP_URL la web funciona igual, sin esos datos.
    'erp' => [
        'url' => rtrim((string) env('ERP_URL'), '/'),
        // Donde el ERP publica sus archivos (logos, imágenes). Por defecto {ERP_URL}/storage
        'storage_url' => rtrim((string) env('ERP_STORAGE_URL'), '/'),
        'timeout' => (int) env('ERP_TIMEOUT', 5),
        'cache_minutos' => (int) env('ERP_CACHE_MINUTOS', 30),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
