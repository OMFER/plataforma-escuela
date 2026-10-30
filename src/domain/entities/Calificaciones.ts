import type { UsuarioResumen } from './Usuario';

export interface Nota {
  calificacion: number;
  puntajeMaximo: number;
}

export interface CalificacionSemana {
  semana: number;
  semanal: Nota | null;
  reposicion: Nota | null;
  /** La mejor (en porcentaje) entre Semanal y Reposición. */
  mejor: Nota | null;
}

export interface CalificacionesAlumno {
  alumno: UsuarioResumen;
  semanas: CalificacionSemana[];
  final: Nota | null;
}
