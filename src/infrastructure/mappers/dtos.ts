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

export interface PlanDto {
  _id: string;
  nombre: string;
  descripcion?: string;
  version: number;
  estado: string;
  publicadoEn?: string;
}

export interface MateriaDto {
  _id: string;
  /** El id del plan o, en las materias del maestro, el plan completo. */
  plan: string | PlanDto;
  nombre: string;
  descripcion?: string;
  bloque: number;
  /** El id del maestro o, dentro de un plan o un grupo, su resumen. */
  maestro?: RefDto | null;
}

export interface PlanDetalladoDto extends PlanDto {
  materias?: MateriaDto[];
}

export interface RevisionPlanDto {
  listo: boolean;
  pendientes?: string[];
}

export interface CambioDto {
  _id: string;
  entidad: string;
  entidadId: string;
  accion: string;
  autor: string;
  fecha: string;
  antes?: unknown;
  despues?: unknown;
}

export interface SemanaDto {
  numero: number;
  inicio: string;
  fin: string;
  estado: string;
  bloque?: number;
  semanaDeMateria?: number;
}

export interface GrupoDto {
  _id: string;
  nombre: string;
  fechaInicio: string;
  plan: PlanDto | { _id: string };
  materias?: MateriaDto[];
  semanaActual?: number;
  semanas?: SemanaDto[];
}

export interface NotaExamenDto {
  semana: number;
  numero: number;
  calificacion: number | null;
}

export interface BoletaMateriaDto {
  materia: string;
  notas?: NotaExamenDto[];
  promedio: number;
  aprobada: boolean;
  completa: boolean;
}

export interface CalificacionesGrupoDto {
  materias?: { _id: string; nombre: string; bloque: number }[];
  boletas?: { alumno: RefDto; materias?: BoletaMateriaDto[]; promedioGeneral?: number }[];
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
    presentacion?: string;
    descGrabacion?: string;
  };
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
  semana: number;
  numero: number;
  titulo: string;
  descripcion?: string;
  diasExtra?: number;
  tieneRespuestas?: boolean;
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
  materia: RefDto;
  semana: number;
  numero: number;
  semanaDelGrupo?: number;
  titulo: string;
  descripcion?: string;
  totalPreguntas?: number;
  ventana: VentanaDto;
  miIntento?: ResultadoIntentoDto | null;
}

export interface ExamenGrupoDto extends ResumenExamenDto {
  preguntas?: PreguntaDto[];
}

export interface ResultadoRevisionDto extends ResultadoIntentoDto {
  revision?: PreguntaDto[];
  ventana?: VentanaDto;
}
