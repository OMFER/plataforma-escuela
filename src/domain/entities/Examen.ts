export const TIPOS_EXAMEN = ['Semanal', 'Parcial', 'Final', 'PuntoExtra'] as const;
export type TipoExamen = (typeof TIPOS_EXAMEN)[number];

export const MIN_OPCIONES = 2;
export const MAX_OPCIONES = 6;
export const PUNTAJE_MAXIMO_POR_DEFECTO = 100;

export interface Pregunta {
  id?: string;
  enunciado: string;
  opciones: string[];
  /** Solo visible para maestro/admin. */
  respuestaCorrecta?: number;
}

export interface ResultadoIntento {
  aciertos: number;
  totalPreguntas: number;
  calificacion: number;
  fecha: string;
}

export interface Examen {
  id: string;
  materiaId: string;
  semana?: number;
  titulo: string;
  descripcion?: string;
  tipo: TipoExamen;
  fechaLimite?: string;
  puntajeMaximo: number;
  preguntas: Pregunta[];
  /** Solo para el alumno: null si aún no responde. */
  miIntento?: ResultadoIntento | null;
}

export interface PreguntaNueva {
  enunciado: string;
  opciones: string[];
  respuestaCorrecta: number;
}

export interface CambiosExamen {
  titulo?: string;
  descripcion?: string;
  tipo?: TipoExamen;
  fechaLimite?: string;
  puntajeMaximo?: number;
  preguntas?: PreguntaNueva[];
}

export interface NuevoExamen extends CambiosExamen {
  materiaId: string;
  semana?: number;
  titulo: string;
  preguntas: PreguntaNueva[];
}

export interface IntentoAlumno {
  id: string;
  alumno: { id: string; nombre: string; correo: string };
  respuestas: number[];
  aciertos: number;
  totalPreguntas: number;
  calificacion: number;
  fecha: string;
}
