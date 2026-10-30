import type { CalificacionesAlumno, Nota } from '../../domain/entities/Calificaciones';
import { TIPOS_RECURSO, type ContenidoSemana, type Recurso, type TipoRecurso } from '../../domain/entities/Contenido';
import {
  PUNTAJE_MAXIMO_POR_DEFECTO,
  TIPOS_EXAMEN,
  type EstadoVentana,
  type Examen,
  type ExamenGrupo,
  type IntentoAlumno,
  type PreguntaRevisada,
  type PreguntaVista,
  type ResultadoConRevision,
  type ResultadoIntento,
  type ResumenExamen,
  type TipoExamen,
  type Ventana,
} from '../../domain/entities/Examen';
import type { EstadoSemana, Grupo, Semana } from '../../domain/entities/Grupo';
import type { Materia } from '../../domain/entities/Materia';
import { esRol, type Usuario, type UsuarioResumen } from '../../domain/entities/Usuario';
import type {
  CalificacionesAlumnoDto,
  ClaseDto,
  ExamenDto,
  ExamenGrupoDto,
  GrupoDto,
  IntentoDto,
  MateriaDto,
  NotaDto,
  PreguntaDto,
  RecursoDto,
  RefDto,
  ResultadoIntentoDto,
  ResultadoRevisionDto,
  ResumenExamenDto,
  SemanaDto,
  UsuarioDto,
  VentanaDto,
} from './dtos';

const idDeRef = (ref: RefDto | null | undefined): string => (typeof ref === 'string' ? ref : (ref?._id ?? ''));

const aResumenUsuario = (ref: RefDto | null | undefined): UsuarioResumen =>
  typeof ref === 'object' && ref !== null
    ? { id: ref._id, nombre: ref.nombre ?? '', ...(ref.correo ? { correo: ref.correo } : {}) }
    : { id: ref ?? '', nombre: '' };

export const aUsuario = (dto: UsuarioDto): Usuario => ({
  id: dto._id ?? dto.id ?? '',
  nombre: dto.nombre,
  correo: dto.correo,
  rol: esRol(dto.rol) ? dto.rol : 'alumno',
  ...(dto.grupos ? { grupos: dto.grupos.map(idDeRef) } : {}),
});

export const aMateria = (dto: MateriaDto): Materia => ({
  id: dto._id,
  nombre: dto.nombre,
  ...(dto.descripcion ? { descripcion: dto.descripcion } : {}),
  totalSemanas: dto.totalSemanas,
});

const ESTADOS_SEMANA: EstadoSemana[] = ['completada', 'actual', 'futura'];

const aSemana = (dto: SemanaDto): Semana => ({
  numero: dto.numero,
  inicio: dto.inicio,
  fin: dto.fin,
  estado: (ESTADOS_SEMANA as string[]).includes(dto.estado) ? (dto.estado as EstadoSemana) : 'futura',
});

export const aGrupo = (dto: GrupoDto): Grupo => ({
  id: dto._id,
  nombre: dto.nombre,
  periodo: dto.periodo,
  ...(dto.aula ? { aula: dto.aula } : {}),
  fechaInicio: dto.fechaInicio,
  materia: typeof dto.materia === 'string' ? { id: dto.materia, nombre: '', totalSemanas: 0 } : aMateria(dto.materia),
  maestro: aResumenUsuario(dto.maestro),
  semanaActual: dto.semanaActual ?? 0,
  semanas: (dto.semanas ?? []).map(aSemana),
});

const aNota = (dto: NotaDto | null | undefined): Nota | null =>
  dto ? { calificacion: dto.calificacion, puntajeMaximo: dto.puntajeMaximo } : null;

export const aCalificaciones = (dto: CalificacionesAlumnoDto): CalificacionesAlumno => ({
  alumno: aResumenUsuario(dto.alumno),
  semanas: (dto.semanas ?? []).map((s) => ({
    semana: s.semana,
    semanal: aNota(s.semanal),
    reposicion: aNota(s.reposicion),
    mejor: aNota(s.mejor),
  })),
  final: aNota(dto.final),
});

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

const aTipo = (tipo: string | undefined): TipoExamen =>
  (TIPOS_EXAMEN as readonly string[]).includes(tipo ?? '') ? (tipo as TipoExamen) : 'Semanal';

const semanaOpcional = (semana: number | null | undefined) => (typeof semana === 'number' ? { semana } : {});

export const aExamen = (dto: ExamenDto): Examen => ({
  id: dto._id,
  materiaId: idDeRef(dto.materia),
  tipo: aTipo(dto.tipo),
  ...semanaOpcional(dto.semana),
  titulo: dto.titulo,
  ...(dto.descripcion ? { descripcion: dto.descripcion } : {}),
  puntajeMaximo: dto.puntajeMaximo ?? PUNTAJE_MAXIMO_POR_DEFECTO,
  diasExtra: dto.diasExtra ?? 0,
  preguntas: (dto.preguntas ?? []).map((p) => ({
    ...(p._id ? { id: p._id } : {}),
    enunciado: p.enunciado,
    opciones: p.opciones,
    respuestaCorrecta: p.respuestaCorrecta ?? 0,
  })),
});

export const aResultado = (dto: ResultadoIntentoDto): ResultadoIntento => ({
  aciertos: dto.aciertos,
  totalPreguntas: dto.totalPreguntas,
  calificacion: dto.calificacion,
  fecha: dto.fecha ?? dto.createdAt ?? '',
});

const ESTADOS_VENTANA: EstadoVentana[] = ['proxima', 'abierta', 'cerrada'];

const aVentana = (dto: VentanaDto): Ventana => ({
  abre: dto.abre,
  cierra: dto.cierra,
  estado: (ESTADOS_VENTANA as string[]).includes(dto.estado) ? (dto.estado as EstadoVentana) : 'cerrada',
});

export const aResumenExamen = (dto: ResumenExamenDto): ResumenExamen => ({
  id: dto._id,
  tipo: aTipo(dto.tipo),
  ...semanaOpcional(dto.semana),
  titulo: dto.titulo,
  ...(dto.descripcion ? { descripcion: dto.descripcion } : {}),
  puntajeMaximo: dto.puntajeMaximo ?? PUNTAJE_MAXIMO_POR_DEFECTO,
  totalPreguntas: dto.totalPreguntas ?? 0,
  ventana: aVentana(dto.ventana),
  ...(dto.miIntento !== undefined ? { miIntento: dto.miIntento ? aResultado(dto.miIntento) : null } : {}),
});

const aPreguntaVista = (dto: PreguntaDto, i: number): PreguntaVista => ({
  id: dto._id ?? String(i),
  enunciado: dto.enunciado,
  opciones: dto.opciones,
  ...(typeof dto.respuestaCorrecta === 'number' ? { respuestaCorrecta: dto.respuestaCorrecta } : {}),
  ...(typeof dto.miRespuesta === 'number' ? { miRespuesta: dto.miRespuesta } : {}),
  ...(typeof dto.acierto === 'boolean' ? { acierto: dto.acierto } : {}),
});

export const aExamenGrupo = (dto: ExamenGrupoDto): ExamenGrupo => ({
  ...aResumenExamen(dto),
  preguntas: (dto.preguntas ?? []).map(aPreguntaVista),
});

const aPreguntaRevisada = (dto: PreguntaDto, i: number): PreguntaRevisada => ({
  id: dto._id ?? String(i),
  enunciado: dto.enunciado,
  opciones: dto.opciones,
  respuestaCorrecta: dto.respuestaCorrecta ?? -1,
  miRespuesta: dto.miRespuesta ?? -1,
  acierto: dto.acierto ?? false,
});

export const aResultadoConRevision = (dto: ResultadoRevisionDto): ResultadoConRevision => ({
  ...aResultado(dto),
  revision: (dto.revision ?? []).map(aPreguntaRevisada),
});

export const aIntento = (dto: IntentoDto): IntentoAlumno => {
  const alumno = aResumenUsuario(dto.alumno);
  return {
    id: dto._id,
    examenId: idDeRef(dto.examen),
    alumno: { id: alumno.id, nombre: alumno.nombre, correo: alumno.correo ?? '' },
    respuestas: dto.respuestas,
    ...aResultado(dto),
  };
};
