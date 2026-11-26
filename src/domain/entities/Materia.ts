import type { Plan } from './Plan';
import type { UsuarioResumen } from './Usuario';

/** Una materia dentro de una versión del plan. Su contenido y exámenes cuelgan de ella. */
export interface Materia {
  id: string;
  planId: string;
  nombre: string;
  descripcion?: string;
  /** Bloque de dos semanas en que se cursa: 1 = semanas 1 y 2 del grupo, 2 = semanas 3 y 4… */
  bloque: number;
  /** Cuenta de la escuela que corrige su contenido y exámenes. */
  maestroId?: string;
}

export interface MateriaConMaestro extends Materia {
  maestro?: UsuarioResumen;
}

/** Una materia junto con la versión del plan a la que pertenece. */
export interface MateriaEnPlan extends Materia {
  plan: Plan;
}

export interface NuevaMateria {
  planId: string;
  nombre: string;
  descripcion?: string;
  bloque: number;
  maestroId?: string;
}

export interface CambiosMateria {
  nombre?: string;
  descripcion?: string;
  bloque?: number;
  /** null quita al maestro asignado. */
  maestroId?: string | null;
}
