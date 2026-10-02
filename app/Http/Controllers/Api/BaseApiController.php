<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;

/**
 * Base de los controladores de la API (mismo formato que el ERP):
 * { success, message, data } con los helpers de ApiResponseTrait.
 * Los controladores solo reciben el Request validado, llaman al Service y responden con un Resource.
 */
class BaseApiController extends Controller
{
    use ApiResponseTrait;
}
