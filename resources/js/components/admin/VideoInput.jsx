import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Video from '@/components/web/Video';
import { parsearVideo } from '@/lib/video';

/**
 * Campo para pegar el enlace de un video (YouTube, TikTok, Facebook o Vimeo) con vista previa.
 * El servidor valida el mismo formato (VideoRegla).
 */
export default function VideoInput({ id = 'video_url', label = 'Video (enlace)', value, onChange, error, hint, className }) {
    const video = parsearVideo(value);

    return (
        <div className={className}>
            <FormField
                label={label}
                htmlFor={id}
                error={error}
                hint={hint ?? 'Pega el enlace de YouTube, TikTok, Facebook o Vimeo. Déjalo vacío si no hay video.'}
            >
                <Input id={id} inputMode="url" value={value ?? ''} onChange={(e) => onChange(e.target.value)} error={error} placeholder="https://www.youtube.com/watch?v=..." />
            </FormField>
            {value && !error && !video && (
                <p className="mt-1.5 text-sm text-amber-700">No reconocemos este enlace. Abre el video y copia el enlace completo desde el navegador.</p>
            )}
            {/* Vista previa chica: los videos verticales (shorts, TikTok, reels) más angostos */}
            {video && <Video key={value} url={value} titulo="Vista previa" className={video.vertical ? 'mt-3 ml-0 max-w-[11rem]' : 'mt-3 max-w-sm'} />}
        </div>
    );
}
