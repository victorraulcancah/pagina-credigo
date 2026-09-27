<?php

namespace App\Mail;

use App\Models\MensajeContacto;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Aviso al equipo: llegó una solicitud desde la web (contacto o cotizador). */
class NuevaSolicitud extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public MensajeContacto $mensaje) {}

    public function envelope(): Envelope
    {
        $tipo = $this->mensaje->origen === 'cotizador' ? 'Nueva cotización' : 'Nuevo mensaje';

        return new Envelope(
            subject: "{$tipo} de {$this->mensaje->nombre}".($this->mensaje->asunto ? " — {$this->mensaje->asunto}" : ''),
            replyTo: $this->mensaje->email ? [$this->mensaje->email] : [],
        );
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.nueva-solicitud');
    }
}
