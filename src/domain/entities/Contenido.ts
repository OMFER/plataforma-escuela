export const TIPOS_RECURSO = ['pdf', 'web', 'youtube'] as const;
export type TipoRecurso = (typeof TIPOS_RECURSO)[number];

export interface Recurso {
  tipo: TipoRecurso;
  titulo: string;
  url: string;
  descripcion?: string;
}

export interface LinksClase {
  grabacion?: string;
  enVivo?: string;
  presentacion?: string;
  descGrabacion?: string;
}

export interface ContenidoSemana {
  id: string;
  materiaId: string;
  semana: number;
  tema: string;
  introduccion?: string;
  recursos: Recurso[];
  links?: LinksClase;
  fechaEnVivo?: string;
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
