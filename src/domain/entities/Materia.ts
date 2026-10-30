/** Materia permanente: su contenido y exámenes se reutilizan cada semestre. */
export interface Materia {
  id: string;
  nombre: string;
  descripcion?: string;
  totalSemanas: number;
}

export interface NuevaMateria {
  nombre: string;
  descripcion?: string;
  totalSemanas?: number;
}

export type CambiosMateria = Partial<NuevaMateria>;

export const TOTAL_SEMANAS_POR_DEFECTO = 16;
export const MIN_SEMANAS = 1;
export const MAX_SEMANAS = 52;
