<?php

namespace App\Services;

use App\Mail\ReclamacionRegistrada;
use App\Mail\ReclamacionRespondida;
use App\Models\Reclamacion;
use App\Models\ReclamacionAdjunto;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\HeaderUtils;
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

    /** Bandeja del panel: búsqueda por texto y estado (pendiente / atendido). */
    public function paginar(?string $buscar, string $estado): LengthAwarePaginator
    {
        return Reclamacion::query()
            ->with(['respondidoPor:id,name', 'adjuntos:id,reclamacion_id,tipo,nombre_original,mime,tamano'])
            ->buscar($buscar)
            ->when($estado !== 'todos', fn ($q) => $q->where('estado', $estado))
            ->latest()
            ->paginate(15)
            ->withQueryString();
    }

    /** Muestra un adjunto guardado en el disco privado (solo para el panel). */
    /**
     * Adjunto para verlo dentro del panel (inline). Se sirve como archivo para que
     * el navegador pueda pedir por partes y adelantar los videos.
     */
    public function adjunto(ReclamacionAdjunto $adjunto): BinaryFileResponse
    {
        $disco = Storage::disk(ReclamacionAdjunto::DISCO);
        abort_unless($disco->exists($adjunto->ruta), 404);

        // El encabezado no admite barras; la versión ASCII tampoco "%" (la usan navegadores antiguos)
        $nombre = str_replace(['/', '\\'], '-', $adjunto->nombre_original);
        $nombreAscii = str_replace('%', '', Str::ascii($nombre)) ?: 'adjunto';

        return response()->file($disco->path($adjunto->ruta), [
            'Content-Type' => $adjunto->mime,
            'Content-Disposition' => HeaderUtils::makeDisposition(HeaderUtils::DISPOSITION_INLINE, $nombre, $nombreAscii),
        ]);
    }

    /** Hoja de un consumidor por su número y su documento (así nadie consulta hojas ajenas). */
    public function consultar(string $codigo, string $numeroDocumento): ?Reclamacion
    {
        return Reclamacion::where('codigo', trim($codigo))
            ->where('numero_documento', strtoupper(preg_replace('/\s+/', '', $numeroDocumento)))
            ->first();
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
