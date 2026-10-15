<?php

namespace App\Services;

use App\Models\Testimonio;
use Illuminate\Database\Eloquent\Collection;

/** Historias de conductores: se administran en el panel y se ven en el inicio y en /historias. */
class TestimonioService
{
    private const CARPETA = 'testimonios';

    private const CAMPOS_ARCHIVO = ['foto', 'quitar_foto', 'foto_vehiculo', 'quitar_foto_vehiculo', 'video', 'quitar_video'];

    public function __construct(private ImagenService $imagenes) {}

    public function listar(): Collection
    {
        return Testimonio::ordenado()->get();
    }

    /** Los publicados, en orden (todos o los primeros `$limite`). */
    public function publicados(?int $limite = null): Collection
    {
        return Testimonio::publicado()->ordenado()->when($limite, fn ($q) => $q->limit($limite))->get();
    }

    public function totalPublicados(): int
    {
        return Testimonio::publicado()->count();
    }

    public function crear(array $datos): Testimonio
    {
        return Testimonio::create($this->conImagenes($datos));
    }

    public function actualizar(Testimonio $testimonio, array $datos): Testimonio
    {
        $testimonio->update($this->conImagenes($datos, $testimonio));

        return $testimonio->refresh();
    }

    public function eliminar(Testimonio $testimonio): void
    {
        $this->imagenes->eliminar($testimonio->foto);
        $this->imagenes->eliminar($testimonio->foto_vehiculo);
        $this->imagenes->eliminar($testimonio->video);
        $testimonio->delete();
    }

    /** Datos del formulario + las dos fotos (conductor y vehículo) y el video subido. */
    private function conImagenes(array $datos, ?Testimonio $testimonio = null): array
    {
        return [
            ...collect($datos)->except(self::CAMPOS_ARCHIVO)->all(),
            ...$this->imagenes->resolver($datos, $testimonio?->foto, self::CARPETA, 'foto'),
            ...$this->imagenes->resolver($datos, $testimonio?->foto_vehiculo, self::CARPETA, 'foto_vehiculo'),
            ...$this->imagenes->resolver($datos, $testimonio?->video, self::CARPETA.'/videos', 'video'),
        ];
    }
}
