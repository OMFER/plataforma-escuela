export type EstadoSemana = 'completada' | 'actual' | 'futura';

export interface Semana {
  numero: number;
  inicio: string;
  fin: string;
  estado: EstadoSemana;
}

export interface MaestroResumen {
  id: string;
  nombre: string;
  correo?: string;
}

export interface Materia {
  id: string;
  nombre: string;
  descripcion?: string;
  grupo?: string;
  aula?: string;
  maestro: MaestroResumen;
  fechaInicio: string;
  totalSemanas: number;
  /** 0 = no ha empezado; totalSemanas + 1 = terminó. */
  semanaActual: number;
  semanas: Semana[];
}

export interface NuevaMateria {
  nombre: string;
  descripcion?: string;
  grupo?: string;
  aula?: string;
  maestroId: string;
  /** Formato YYYY-MM-DD */
  fechaInicio: string;
  totalSemanas?: number;
}

export const TOTAL_SEMANAS_POR_DEFECTO = 16;
