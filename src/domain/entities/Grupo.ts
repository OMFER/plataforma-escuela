import type { Materia } from './Materia';
import type { UsuarioResumen } from './Usuario';

export type EstadoSemana = 'completada' | 'actual' | 'futura';

export interface Semana {
  numero: number;
  inicio: string;
  fin: string;
  estado: EstadoSemana;
}

/** Grupo de un semestre: una materia impartida por un maestro a partir de una fecha. */
export interface Grupo {
  id: string;
  nombre: string;
  /** Por ejemplo "2026-B". */
  periodo: string;
  aula?: string;
  fechaInicio: string;
  materia: Materia;
  maestro: UsuarioResumen;
  /** 0 = no ha empezado; materia.totalSemanas + 1 = terminó. */
  semanaActual: number;
  semanas: Semana[];
}

export interface NuevoGrupo {
  materiaId: string;
  maestroId: string;
  nombre: string;
  periodo: string;
  aula?: string;
  /** Formato YYYY-MM-DD */
  fechaInicio: string;
}
