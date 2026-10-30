const ID_VALIDO = /^[A-Za-z0-9_-]{11}$/;
const HOSTS_YOUTUBE = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'];

/**
 * Extrae el id de un video de YouTube a partir de URLs tipo
 * `watch?v=`, `youtu.be/`, `shorts/`, `embed/` o `live/`. Devuelve null si no es posible.
 */
export const extraerIdYoutube = (url: string): string | null => {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  const segmentos = parsed.pathname.split('/').filter(Boolean);
  let id: string | null = null;

  if (host === 'youtu.be' || host === 'www.youtu.be') {
    id = segmentos[0] ?? null;
  } else if (HOSTS_YOUTUBE.includes(host)) {
    if (segmentos[0] === 'watch') {
      id = parsed.searchParams.get('v');
    } else if (['shorts', 'embed', 'live', 'v'].includes(segmentos[0] ?? '')) {
      id = segmentos[1] ?? null;
    }
  }

  return id && ID_VALIDO.test(id) ? id : null;
};

export const urlEmbedYoutube = (id: string): string => `https://www.youtube-nocookie.com/embed/${id}`;
