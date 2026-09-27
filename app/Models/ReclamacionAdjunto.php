<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Archivo adjunto a una hoja de reclamación (guardado en el disco privado `local`). */
class ReclamacionAdjunto extends Model
{
    public const DISCO = 'local';

    protected $table = 'reclamacion_adjuntos';

    protected $fillable = ['reclamacion_id', 'tipo', 'ruta', 'nombre_original', 'mime', 'tamano'];

    protected $hidden = ['ruta'];

    public function reclamacion(): BelongsTo
    {
        return $this->belongsTo(Reclamacion::class);
    }
}
