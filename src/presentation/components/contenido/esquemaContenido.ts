import { z } from 'zod';
import { TIPOS_RECURSO, type CambiosContenidoSemana, type ContenidoSemana } from '../../../domain/entities/Contenido';

const MENSAJE_URL = 'Escribe una URL válida que empiece con http:// o https://';
const urlHttp = z.url({ protocol: /^https?$/, error: MENSAJE_URL });

export const esquemaRecurso = z.object({
  tipo: z.enum(TIPOS_RECURSO),
  titulo: z.string().trim().min(1, 'Escribe un título para el recurso.'),
  url: urlHttp,
  descripcion: z.string(),
});

export const esquemaContenido = z.object({
  tema: z.string().trim().min(1, 'El tema es obligatorio.').max(200, 'Máximo 200 caracteres.'),
  introduccion: z.string(),
  recursos: z.array(esquemaRecurso),
  grabacion: z.union([z.literal(''), urlHttp]),
});

export type FormularioContenidoValores = z.infer<typeof esquemaContenido>;

export const recursoVacio = (): FormularioContenidoValores['recursos'][number] => ({
  tipo: 'web',
  titulo: '',
  url: '',
  descripcion: '',
});

export const valoresIniciales = (contenido: ContenidoSemana | null): FormularioContenidoValores => ({
  tema: contenido?.tema ?? '',
  introduccion: contenido?.introduccion ?? '',
  recursos: (contenido?.recursos ?? []).map((r) => ({ ...r, descripcion: r.descripcion ?? '' })),
  grabacion: contenido?.links?.grabacion ?? '',
});

/** Convierte los valores del formulario al modelo de dominio, preservando los demás links existentes. */
export const aCambiosContenido = (
  valores: FormularioContenidoValores,
  existente: ContenidoSemana | null,
): CambiosContenidoSemana => ({
  tema: valores.tema,
  introduccion: valores.introduccion,
  recursos: valores.recursos.map((r) => ({
    tipo: r.tipo,
    titulo: r.titulo,
    url: r.url,
    ...(r.descripcion.trim() ? { descripcion: r.descripcion } : {}),
  })),
  links: { ...existente?.links, grabacion: valores.grabacion || undefined },
});
