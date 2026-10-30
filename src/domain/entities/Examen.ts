export const TIPOS_EXAMEN = ['Semanal', 'Reposicion', 'Final'] as const;
export type TipoExamen = (typeof TIPOS_EXAMEN)[number];

export const esTipoExamen = (valor: unknown): valor is TipoExamen =>
  typeof valor === 'string' && (TIPOS_EXAMEN as readonly string[]).includes(valor);

export const MIN_OPCIONES = 2;
export const MAX_OPCIONES = 6;
export const PUNTAJE_MAXIMO_POR_DEFECTO = 100;
export const DIAS_EXTRA_MAX = 30;

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

/** Plantilla del examen dentro de la materia (con respuestas; solo maestro/admin). */
export interface Examen {
  id: string;
  materiaId: string;
  tipo: TipoExamen;
  /** Solo Semanal y Reposicion. */
  semana?: number;
  titulo: string;
  descripcion?: string;
  puntajeMaximo: number;
  diasExtra: number;
  preguntas: Pregunta[];
}

export interface CambiosExamen {
  titulo?: string;
  descripcion?: string;
  puntajeMaximo?: number;
  diasExtra?: number;
  preguntas?: PreguntaNueva[];
}

export interface NuevoExamen extends CambiosExamen {
  materiaId: string;
  tipo: TipoExamen;
  semana?: number;
  titulo: string;
  preguntas: PreguntaNueva[];
}

export interface ResultadoIntento {
  aciertos: number;
  totalPreguntas: number;
  calificacion: number;
  fecha: string;
}

/** Examen visto desde un grupo: su ventana y, para el alumno, su intento. */
export interface ResumenExamen {
  id: string;
  tipo: TipoExamen;
  semana?: number;
  titulo: string;
  descripcion?: string;
  puntajeMaximo: number;
  totalPreguntas: number;
  ventana: Ventana;
  /** Solo para el alumno: null si aún no responde. */
  miIntento?: ResultadoIntento | null;
}

export interface ExamenesSemana {
  semanal: ResumenExamen | null;
  reposicion: ResumenExamen | null;
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
  respuestaCorrecta: number;
  miRespuesta: number;
  acierto: boolean;
}

export interface ExamenGrupo extends ResumenExamen {
  preguntas: PreguntaVista[];
}

export interface ResultadoConRevision extends ResultadoIntento {
  revision: PreguntaRevisada[];
}

export interface IntentoAlumno {
  id: string;
  examenId: string;
  alumno: { id: string; nombre: string; correo: string };
  respuestas: number[];
  aciertos: number;
  totalPreguntas: number;
  calificacion: number;
  fecha: string;
}
