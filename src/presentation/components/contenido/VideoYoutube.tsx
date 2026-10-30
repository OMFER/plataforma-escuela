import type { Recurso } from '../../../domain/entities/Contenido';
import { urlEmbedYoutube } from '../../../domain/rules/youtube';

interface VideoYoutubeProps {
  videoId: string;
  recurso: Recurso;
}

export const VideoYoutube = ({ videoId, recurso }: VideoYoutubeProps) => (
  <figure className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
    <div className="relative w-full aspect-video bg-inverse-surface">
      <iframe
        className="absolute inset-0 w-full h-full"
        src={urlEmbedYoutube(videoId)}
        title={recurso.titulo}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
    <figcaption className="p-5">
      <p className="text-title-md text-on-surface">{recurso.titulo}</p>
      {recurso.descripcion && <p className="text-body-sm text-on-surface-variant mt-1">{recurso.descripcion}</p>}
    </figcaption>
  </figure>
);
