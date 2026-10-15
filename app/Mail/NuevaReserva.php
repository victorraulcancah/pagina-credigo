<?php

namespace App\Mail;

use App\Models\Reserva;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Aviso al equipo: llegó una reserva desde la web. */
class NuevaReserva extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Reserva $reserva) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Nueva reserva ({$this->reserva->tipo}) de {$this->reserva->nombre} — {$this->reserva->fecha->format('d/m/Y')}");
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.nueva-reserva');
    }
}
