<?php

namespace App\Services;

use App\Mail\ReclamacionRegistrada;
use App\Mail\ReclamacionRespondida;
use App\Models\Reclamacion;
use App\Models\ReclamacionAdjunto;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ReclamacionService
{
    public function __construct(private ConfiguracionService $configuracion) {}

    /**
     * Registra la hoja de reclamación con su número correlativo, guarda los
     * adjuntos en el disco privado y envía la copia al consumidor (con copia a la empresa).
     *
     * @param  array<string, UploadedFile[]>  $archivos  por tipo: foto | comprobante | video
     */
    public function registrar(array $datos, array $archivos, ?string $ip): Reclamacion
    {
        $rutasGuardadas = [];

        try {
            $reclamacion = DB::transaction(function () use ($datos, $archivos, $ip, &$rutasGuardadas) {
                $reclamacion = Reclamacion::create([
                    ...$datos,
                    'proveedor' => $this->datosProveedor(),
                    'ip' => $ip,
                ]);

                // El id es único y correlativo: el código no se repite ni salta números
                $reclamacion->update(['codigo' => sprintf('%s-%06d', now()->year, $reclamacion->id)]);

                foreach ($archivos as $tipo => $lista) {
                    foreach ($lista as $archivo) {
                        $ruta = $archivo->store("reclamaciones/{$reclamacion->id}", ReclamacionAdjunto::DISCO);
                        $rutasGuardadas[] = $ruta;

                        $reclamacion->adjuntos()->create([
                            'tipo' => $tipo,
                            'ruta' => $ruta,
                            'nombre_original' => $archivo->getClientOriginalName(),
                            'mime' => $archivo->getMimeType(),
                            'tamano' => $archivo->getSize(),
                        ]);
                    }
                }

                return $reclamacion;
            });
        } catch (Throwable $e) {
            // Si algo falla, no quedan archivos sueltos sin hoja
            Storage::disk(ReclamacionAdjunto::DISCO)->delete($rutasGuardadas);

            throw $e;
        }

        $this->enviarCorreo(new ReclamacionRegistrada($reclamacion->load('adjuntos')), $reclamacion);

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
            // Copia oculta al equipo (Panel → Empresa y contacto → Notificaciones)
            $equipo = $this->configuracion->correosInternos();

            Mail::to($reclamacion->email)
                ->when($equipo, fn ($mail) => $mail->bcc($equipo))
                ->send($correo);
        } catch (Throwable $e) {
            Log::error("No se pudo enviar el correo de la reclamación {$reclamacion->codigo}: {$e->getMessage()}");
        }
    }
}
