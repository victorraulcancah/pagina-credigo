<?php

namespace App\Mail;

use App\Models\Reclamacion;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Respuesta del proveedor a la hoja de reclamación. */
class ReclamacionRespondida extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Reclamacion $reclamacion) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Respuesta a tu {$this->reclamacion->tipo} N° {$this->reclamacion->codigo}",
        );
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.reclamacion-respondida');
    }
}
