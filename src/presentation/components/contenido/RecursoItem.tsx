import type { Recurso } from '../../../domain/entities/Contenido';
import { extraerIdYoutube } from '../../../domain/rules/youtube';
import { TarjetaEnlace } from './TarjetaEnlace';
import { VideoYoutube } from './VideoYoutube';

/** Elige la representación de cada recurso: video incrustado o tarjeta-enlace. */
export const RecursoItem = ({ recurso }: { recurso: Recurso }) => {
  if (recurso.tipo === 'youtube') {
    const videoId = extraerIdYoutube(recurso.url);
    if (videoId) return <VideoYoutube videoId={videoId} recurso={recurso} />;
  }
  return <TarjetaEnlace recurso={recurso} />;
};
