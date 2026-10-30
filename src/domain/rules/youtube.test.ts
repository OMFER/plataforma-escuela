import { describe, expect, it } from 'vitest';
import { extraerIdYoutube, urlEmbedYoutube } from './youtube';

describe('extraerIdYoutube', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s', 'dQw4w9WgXcQ'],
    ['https://m.youtube.com/watch?feature=share&v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?si=abc', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['  https://youtu.be/dQw4w9WgXcQ  ', 'dQw4w9WgXcQ'],
  ])('extrae el id de %s', (url, id) => {
    expect(extraerIdYoutube(url)).toBe(id);
  });

  it.each([
    'https://www.youtube.com/',
    'https://www.youtube.com/watch?v=corto',
    'https://www.youtube.com/channel/UC123',
    'https://vimeo.com/123456',
    'https://example.com/watch?v=dQw4w9WgXcQ',
    'no es una url',
    '',
  ])('devuelve null para %s', (url) => {
    expect(extraerIdYoutube(url)).toBeNull();
  });

  it('construye la URL embebida sin cookies', () => {
    expect(urlEmbedYoutube('dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });
});
