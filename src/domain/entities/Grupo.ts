import type { MateriaConMaestro } from './Materia';
import type { Plan } from './Plan';

export type EstadoSemana = 'completada' | 'actual' | 'futura';

export interface Semana {
  /** Semana del grupo (1, 2, 3…). */
  numero: number;
  inicio: string;
  fin: string;
  estado: EstadoSemana;
  /** Bloque de materias que se cursa esa semana. */
  bloque: number;
  /** Qué semana es de esas materias (1 o 2). */
  semanaDeMateria: number;
}

/** Una generación de alumnos que cursa una versión publicada del plan desde su fecha de inicio. */
export interface Grupo {
  id: string;
  nombre: string;
  /** Lunes en que empieza la semana 1. */
  fechaInicio: string;
  plan: Plan;
  /** Las materias del plan, por bloque. */
  materias: MateriaConMaestro[];
  /** 0 = no ha empezado; semanas.length + 1 = terminó. */
  semanaActual: number;
  semanas: Semana[];
}

export interface NuevoGrupo {
  planId: string;
  nombre: string;
  /** Un lunes, en formato YYYY-MM-DD. */
  fechaInicio: string;
}
