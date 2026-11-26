import { CALIFICACION_APROBATORIA, type BoletaAlumno, type BoletaMateria } from '../entities/Calificaciones';

/** "8.5", "10" o "—" si no hay calificación. */
export const formatearNota = (calificacion: number | null | undefined): string =>
  calificacion === null || calificacion === undefined ? '—' : String(Math.round(calificacion * 10) / 10);

export const estaAprobada = (promedio: number): boolean => promedio >= CALIFICACION_APROBATORIA;

/** Boleta del alumno para una materia (por id), si viene en su lista. */
export const boletaDeMateria = (boleta: BoletaAlumno | undefined, materiaId: string): BoletaMateria | undefined =>
  boleta?.materias.find((m) => m.materiaId === materiaId);

/** "Aprobada", "Reprobada" o "En curso" (aún le faltan exámenes por presentar). */
export const situacionDeMateria = (boleta: BoletaMateria): 'aprobada' | 'reprobada' | 'en-curso' => {
  if (!boleta.completa) return 'en-curso';
  return boleta.aprobada ? 'aprobada' : 'reprobada';
};
