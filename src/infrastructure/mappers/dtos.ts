/** Formas que devuelve el backend (NestJS + MongoDB). Solo se usan dentro de infrastructure. */

export type RefDto = string | { _id: string; nombre?: string; correo?: string; rol?: string };

export interface UsuarioDto {
  _id?: string;
  id?: string;
  nombre: string;
  correo: string;
  rol: string;
  materias?: RefDto[];
}

export interface LoginDto {
  access_token: string;
  usuario: UsuarioDto;
}

export interface SemanaDto {
  numero: number;
  inicio: string;
  fin: string;
  estado: string;
}

export interface MateriaDto {
  _id: string;
  nombre: string;
  descripcion?: string;
  grupo?: string;
  aula?: string;
  maestro?: RefDto | null;
  fechaInicio: string;
  totalSemanas: number;
  semanaActual?: number;
  semanas?: SemanaDto[];
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
}

export interface ResultadoIntentoDto {
  aciertos: number;
  totalPreguntas: number;
  calificacion: number;
  fecha?: string;
  createdAt?: string;
}

export interface ExamenDto {
  _id: string;
  materia: RefDto;
  semana?: number;
  titulo: string;
  descripcion?: string;
  tipo?: string;
  fechaLimite?: string;
  puntajeMaximo?: number;
  preguntas?: PreguntaDto[];
  totalPreguntas?: number;
  miIntento?: ResultadoIntentoDto | null;
}

export interface IntentoDto extends ResultadoIntentoDto {
  _id: string;
  alumno: RefDto;
  respuestas: number[];
}
