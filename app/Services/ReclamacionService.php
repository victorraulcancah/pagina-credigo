<?php

namespace App\Services;

use App\Mail\ReclamacionRegistrada;
use App\Mail\ReclamacionRespondida;
use App\Models\Reclamacion;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class ReclamacionService
{
    public function __construct(private ConfiguracionService $configuracion) {}

    /**
     * Registra la hoja de reclamación con su número correlativo y envía la
     * copia al correo del consumidor (con copia a la empresa).
     */
    public function registrar(array $datos, ?string $ip): Reclamacion
    {
        $reclamacion = DB::transaction(function () use ($datos, $ip) {
            $reclamacion = Reclamacion::create([
                ...$datos,
                'proveedor' => $this->datosProveedor(),
                'ip' => $ip,
            ]);

            // El id es único y correlativo: el código no se repite ni salta números
            $reclamacion->update(['codigo' => sprintf('%s-%06d', now()->year, $reclamacion->id)]);

            return $reclamacion;
        });

        $this->enviarCorreo(new ReclamacionRegistrada($reclamacion), $reclamacion);

        return $reclamacion;
    }

    public function responder(Reclamacion $reclamacion, string $respuesta, User $usuario): void
    {
        $reclamacion->update([
            'respuesta' => $respuesta,
            'estado' => 'atendido',
            'respondido_at' => now(),
            'respondido_por' => $usuario->id,
        ]);

        $this->enviarCorreo(new ReclamacionRespondida($reclamacion), $reclamacion);
    }

    private function datosProveedor(): array
    {
        $ajustes = $this->configuracion->todas();

        return [
            'razon_social' => $ajustes['empresa_razon_social'] ?: $ajustes['empresa_nombre'],
            'ruc' => $ajustes['empresa_ruc'],
            'direccion' => trim(implode(', ', array_filter([$ajustes['contacto_direccion'], $ajustes['contacto_ciudad']]))),
        ];
    }

    /** Si el correo falla, la reclamación igual queda registrada (se anota en el log). */
    private function enviarCorreo($correo, Reclamacion $reclamacion): void
    {
        try {
            $empresa = $this->configuracion->get('contacto_email');

            Mail::to($reclamacion->email)
                ->when($empresa, fn ($mail) => $mail->bcc($empresa))
                ->send($correo);
        } catch (Throwable $e) {
            Log::error("No se pudo enviar el correo de la reclamación {$reclamacion->codigo}: {$e->getMessage()}");
        }
    }
}
