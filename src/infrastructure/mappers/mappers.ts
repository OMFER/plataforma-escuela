import { TIPOS_RECURSO, type ContenidoSemana, type Recurso, type TipoRecurso } from '../../domain/entities/Contenido';
import {
  PUNTAJE_MAXIMO_POR_DEFECTO,
  TIPOS_EXAMEN,
  type Examen,
  type IntentoAlumno,
  type ResultadoIntento,
  type TipoExamen,
} from '../../domain/entities/Examen';
import type { EstadoSemana, Materia, Semana } from '../../domain/entities/Materia';
import { esRol, type Usuario } from '../../domain/entities/Usuario';
import type {
  ClaseDto,
  ExamenDto,
  IntentoDto,
  MateriaDto,
  RecursoDto,
  RefDto,
  ResultadoIntentoDto,
  SemanaDto,
  UsuarioDto,
} from './dtos';

const idDeRef = (ref: RefDto | null | undefined): string => (typeof ref === 'string' ? ref : (ref?._id ?? ''));

export const aUsuario = (dto: UsuarioDto): Usuario => ({
  id: dto._id ?? dto.id ?? '',
  nombre: dto.nombre,
  correo: dto.correo,
  rol: esRol(dto.rol) ? dto.rol : 'alumno',
  ...(dto.materias ? { materias: dto.materias.map(idDeRef) } : {}),
});

const ESTADOS: EstadoSemana[] = ['completada', 'actual', 'futura'];

const aSemana = (dto: SemanaDto): Semana => ({
  numero: dto.numero,
  inicio: dto.inicio,
  fin: dto.fin,
  estado: (ESTADOS as string[]).includes(dto.estado) ? (dto.estado as EstadoSemana) : 'futura',
});

export const aMateria = (dto: MateriaDto): Materia => {
  const maestro = dto.maestro;
  return {
    id: dto._id,
    nombre: dto.nombre,
    descripcion: dto.descripcion,
    grupo: dto.grupo,
    aula: dto.aula,
    maestro:
      typeof maestro === 'object' && maestro !== null
        ? { id: maestro._id, nombre: maestro.nombre ?? '', correo: maestro.correo }
        : { id: maestro ?? '', nombre: '' },
    fechaInicio: dto.fechaInicio,
    totalSemanas: dto.totalSemanas,
    semanaActual: dto.semanaActual ?? 0,
    semanas: (dto.semanas ?? []).map(aSemana),
  };
};

const aRecurso = (dto: RecursoDto): Recurso => ({
  tipo: (TIPOS_RECURSO as readonly string[]).includes(dto.tipo) ? (dto.tipo as TipoRecurso) : 'web',
  titulo: dto.titulo,
  url: dto.url,
  ...(dto.descripcion ? { descripcion: dto.descripcion } : {}),
});

export const aContenido = (dto: ClaseDto): ContenidoSemana => ({
  id: dto._id,
  materiaId: idDeRef(dto.materia),
  semana: dto.semana,
  tema: dto.tema,
  introduccion: dto.introduccion,
  recursos: (dto.recursos ?? []).map(aRecurso),
  links: dto.links,
  fechaEnVivo: dto.fechaEnVivo,
});

export const aResultado = (dto: ResultadoIntentoDto): ResultadoIntento => ({
  aciertos: dto.aciertos,
  totalPreguntas: dto.totalPreguntas,
  calificacion: dto.calificacion,
  fecha: dto.fecha ?? dto.createdAt ?? '',
});

export const aExamen = (dto: ExamenDto): Examen => ({
  id: dto._id,
  materiaId: idDeRef(dto.materia),
  semana: dto.semana,
  titulo: dto.titulo,
  descripcion: dto.descripcion,
  tipo: (TIPOS_EXAMEN as readonly string[]).includes(dto.tipo ?? '') ? (dto.tipo as TipoExamen) : 'Semanal',
  fechaLimite: dto.fechaLimite,
  puntajeMaximo: dto.puntajeMaximo ?? PUNTAJE_MAXIMO_POR_DEFECTO,
  preguntas: (dto.preguntas ?? []).map((p) => ({
    id: p._id,
    enunciado: p.enunciado,
    opciones: p.opciones,
    ...(typeof p.respuestaCorrecta === 'number' ? { respuestaCorrecta: p.respuestaCorrecta } : {}),
  })),
  ...(dto.miIntento !== undefined ? { miIntento: dto.miIntento ? aResultado(dto.miIntento) : null } : {}),
});

export const aIntento = (dto: IntentoDto): IntentoAlumno => {
  const alumno = dto.alumno;
  return {
    id: dto._id,
    alumno:
      typeof alumno === 'object'
        ? { id: alumno._id, nombre: alumno.nombre ?? '', correo: alumno.correo ?? '' }
        : { id: alumno, nombre: '', correo: '' },
    respuestas: dto.respuestas,
    ...aResultado(dto),
  };
};
