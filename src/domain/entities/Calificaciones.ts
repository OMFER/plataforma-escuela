import type { UsuarioResumen } from './Usuario';

export const CALIFICACION_APROBATORIA = 6;

export interface NotaExamen {
  semana: number;
  numero: number;
  /** null si el alumno no lo presentó. */
  calificacion: number | null;
}

export interface BoletaMateria {
  materiaId: string;
  /** Siempre cuatro: semana 1 (examen 1 y 2) y semana 2 (examen 1 y 2). */
  notas: NotaExamen[];
  /** Promedio de las cuatro sobre 10; lo que no se presentó cuenta 0 (lo calcula el servidor). */
  promedio: number;
  aprobada: boolean;
  /** Ya presentó todos los exámenes de la materia. */
  completa: boolean;
}

export interface BoletaAlumno {
  alumno: UsuarioResumen;
  /** En el orden de `CalificacionesGrupo.materias`. */
  materias: BoletaMateria[];
  promedioGeneral: number;
}

export interface CalificacionesGrupo {
  /** Materias del plan en el orden en que se cursan. */
  materias: { id: string; nombre: string; bloque: number }[];
  /** Alumno: solo la suya; maestro y admin: la de cada inscrito. */
  boletas: BoletaAlumno[];
}
