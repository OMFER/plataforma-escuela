/** Formas que devuelve el backend (NestJS + MongoDB). Solo se usan dentro de infrastructure. */

export type RefDto = string | { _id: string; nombre?: string; correo?: string; rol?: string };

export interface UsuarioDto {
  _id?: string;
  id?: string;
  nombre: string;
  correo: string;
  rol: string;
  grupos?: RefDto[];
}

export interface LoginDto {
  access_token: string;
  usuario: UsuarioDto;
}

export interface MateriaDto {
  _id: string;
  nombre: string;
  descripcion?: string;
  totalSemanas: number;
}

export interface SemanaDto {
  numero: number;
  inicio: string;
  fin: string;
  estado: string;
}

export interface GrupoDto {
  _id: string;
  nombre: string;
  periodo: string;
  aula?: string;
  fechaInicio: string;
  materia: MateriaDto | string;
  maestro: RefDto | null;
  semanaActual?: number;
  semanas?: SemanaDto[];
}

export interface NotaDto {
  calificacion: number;
  puntajeMaximo: number;
}

export interface CalificacionesAlumnoDto {
  alumno: RefDto;
  semanas?: { semana: number; semanal: NotaDto | null; reposicion: NotaDto | null; mejor: NotaDto | null }[];
  final: NotaDto | null;
}

export interface RecursoDto {
  tipo: string;
  titulo: string;
  url: string;
  descripcion?: string;
}

export interface ClaseDto {
  _id: string;
  materia: RefDto;
  semana: number;
  tema: string;
  introduccion?: string;
  recursos?: RecursoDto[];
  links?: {
    grabacion?: string;
    enVivo?: string;
    presentacion?: string;
    descGrabacion?: string;
  };
  fechaEnVivo?: string;
}

export interface PreguntaDto {
  _id?: string;
  enunciado: string;
  opciones: string[];
  respuestaCorrecta?: number;
  miRespuesta?: number;
  acierto?: boolean;
}

/** Plantilla del examen (con respuestas). */
export interface ExamenDto {
  _id: string;
  materia: RefDto;
  tipo: string;
  semana?: number | null;
  titulo: string;
  descripcion?: string;
  puntajeMaximo?: number;
  diasExtra?: number;
  preguntas?: PreguntaDto[];
}

export interface ResultadoIntentoDto {
  aciertos: number;
  totalPreguntas: number;
  calificacion: number;
  fecha?: string;
  createdAt?: string;
}

export interface VentanaDto {
  abre: string;
  cierra: string;
  estado: string;
}

export interface ResumenExamenDto {
  _id: string;
  tipo: string;
  semana?: number | null;
  titulo: string;
  descripcion?: string;
  puntajeMaximo?: number;
  totalPreguntas?: number;
  ventana: VentanaDto;
  miIntento?: ResultadoIntentoDto | null;
}

export interface ExamenGrupoDto extends ResumenExamenDto {
  preguntas?: PreguntaDto[];
}

export interface ExamenesSemanaDto {
  semanal: ResumenExamenDto | null;
  reposicion: ResumenExamenDto | null;
}

export interface ResultadoRevisionDto extends ResultadoIntentoDto {
  revision?: PreguntaDto[];
}

export interface IntentoDto extends ResultadoIntentoDto {
  _id: string;
  examen: RefDto;
  alumno: RefDto;
  respuestas: number[];
}
