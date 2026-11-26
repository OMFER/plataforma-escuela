export const TIPOS_RECURSO = ['pdf', 'web', 'youtube'] as const;
export type TipoRecurso = (typeof TIPOS_RECURSO)[number];

export interface Recurso {
  tipo: TipoRecurso;
  titulo: string;
  url: string;
  descripcion?: string;
}

export interface LinksClase {
  /** Clase grabada (Drive de la escuela, Zoom, Meet…). */
  grabacion?: string;
  presentacion?: string;
  descGrabacion?: string;
}

export interface ContenidoSemana {
  id: string;
  materiaId: string;
  /** Semana de la materia (1 o 2). */
  semana: number;
  tema: string;
  introduccion?: string;
  recursos: Recurso[];
  links?: LinksClase;
}

export interface CambiosContenidoSemana {
  tema: string;
  introduccion?: string;
  recursos: Recurso[];
  links?: LinksClase;
}

export interface NuevoContenidoSemana extends CambiosContenidoSemana {
  materiaId: string;
  semana: number;
}
