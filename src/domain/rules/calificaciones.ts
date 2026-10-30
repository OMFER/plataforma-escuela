import type { CalificacionesAlumno, Nota } from '../entities/Calificaciones';
import { formatearCalificacion } from './examen';

export const porcentajeNota = (nota: Nota): number =>
  nota.puntajeMaximo > 0 ? (nota.calificacion / nota.puntajeMaximo) * 100 : 0;

/** La mejor de dos notas en porcentaje (en empate, la primera). */
export const mejorNota = (a: Nota | null, b: Nota | null): Nota | null => {
  if (!a) return b;
  if (!b) return a;
  return porcentajeNota(b) > porcentajeNota(a) ? b : a;
};

export const formatearNota = (nota: Nota | null): string =>
  nota ? formatearCalificacion(nota.calificacion, nota.puntajeMaximo) : '—';

/** Semanas presentes en cualquier alumno, ordenadas (columnas de la tabla del maestro). */
export const semanasCalificadas = (calificaciones: CalificacionesAlumno[]): number[] =>
  [...new Set(calificaciones.flatMap((c) => c.semanas.map((s) => s.semana)))].sort((a, b) => a - b);
