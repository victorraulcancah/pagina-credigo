<?php

namespace App\Mail;

use App\Models\Reclamacion;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Copia de la hoja de reclamación para el consumidor. */
class ReclamacionRegistrada extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Reclamacion $reclamacion) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Libro de Reclamaciones - Hoja N° {$this->reclamacion->codigo}",
        );
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.reclamacion-registrada');
    }
}
