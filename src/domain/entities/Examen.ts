export const MIN_OPCIONES = 2;
export const MAX_OPCIONES = 6;
export const DIAS_EXTRA_MAX = 30;
/** Cada examen se califica sobre 10. */
export const ESCALA_CALIFICACION = 10;

export type EstadoVentana = 'proxima' | 'abierta' | 'cerrada';

/** Periodo en que un examen se puede responder dentro de un grupo (lo calcula el backend). */
export interface Ventana {
  abre: string;
  cierra: string;
  estado: EstadoVentana;
}

export interface PreguntaNueva {
  enunciado: string;
  opciones: string[];
  respuestaCorrecta: number;
}

export interface Pregunta extends PreguntaNueva {
  id?: string;
}

/**
 * Plantilla del examen en la materia (con respuestas; solo su maestro y el admin).
 * Hay dos por semana de la materia: el 1 abre el lunes y el 2 el jueves; los dos cuentan.
 */
export interface Examen {
  id: string;
  materiaId: string;
  /** Semana de la materia (1 o 2). */
  semana: number;
  /** Examen 1 o 2 de la semana. */
  numero: number;
  titulo: string;
  descripcion?: string;
  diasExtra: number;
  preguntas: Pregunta[];
  /** Si algún alumno ya lo respondió: solo se puede corregir la redacción de las preguntas. */
  tieneRespuestas?: boolean;
}

export interface CambiosExamen {
  titulo?: string;
  descripcion?: string;
  diasExtra?: number;
  preguntas?: PreguntaNueva[];
}

export interface NuevoExamen extends CambiosExamen {
  materiaId: string;
  semana: number;
  numero: number;
  titulo: string;
  preguntas: PreguntaNueva[];
}

export interface ResultadoIntento {
  aciertos: number;
  totalPreguntas: number;
  /** Sobre 10. */
  calificacion: number;
  fecha: string;
}

/** Examen visto desde un grupo: su materia, su ventana y, para el alumno, su intento. */
export interface ResumenExamen {
  id: string;
  materia: { id: string; nombre: string };
  semana: number;
  numero: number;
  /** Semana del grupo en la que se presenta. */
  semanaDelGrupo: number;
  titulo: string;
  descripcion?: string;
  totalPreguntas: number;
  ventana: Ventana;
  /** Solo para el alumno: null si aún no responde. */
  miIntento?: ResultadoIntento | null;
}

/** Pregunta tal como la entrega el grupo: los campos de revisión llegan solo cuando corresponde. */
export interface PreguntaVista {
  id: string;
  enunciado: string;
  opciones: string[];
  respuestaCorrecta?: number;
  miRespuesta?: number;
  acierto?: boolean;
}

export interface PreguntaRevisada {
  id: string;
  enunciado: string;
  opciones: string[];
  /** Solo llega cuando el examen ya cerró en el grupo: antes, otros alumnos aún podrían responderlo. */
  respuestaCorrecta?: number;
  miRespuesta: number;
  acierto: boolean;
}

export interface ExamenGrupo extends ResumenExamen {
  preguntas: PreguntaVista[];
}

export interface ResultadoConRevision extends ResultadoIntento {
  revision: PreguntaRevisada[];
  /** Ventana del examen en el grupo: las respuestas correctas se muestran a partir de `cierra`. */
  ventana?: Ventana;
}
