import type { BoletaMateria, CalificacionesGrupo } from '../../domain/entities/Calificaciones';
import { TIPOS_RECURSO, type ContenidoSemana, type Recurso, type TipoRecurso } from '../../domain/entities/Contenido';
import type {
  EstadoVentana,
  Examen,
  ExamenGrupo,
  PreguntaRevisada,
  PreguntaVista,
  ResultadoConRevision,
  ResultadoIntento,
  ResumenExamen,
  Ventana,
} from '../../domain/entities/Examen';
import type { EstadoSemana, Grupo, Semana } from '../../domain/entities/Grupo';
import type { Materia, MateriaConMaestro, MateriaEnPlan } from '../../domain/entities/Materia';
import {
  ESTADOS_PLAN,
  type AccionCambio,
  type CambioPlan,
  type EntidadCambio,
  type EstadoPlan,
  type Plan,
  type PlanDetallado,
} from '../../domain/entities/Plan';
import { esRol, type Usuario, type UsuarioResumen } from '../../domain/entities/Usuario';
import type {
  CalificacionesGrupoDto,
  CambioDto,
  ClaseDto,
  ExamenDto,
  ExamenGrupoDto,
  GrupoDto,
  MateriaDto,
  PlanDetalladoDto,
  PlanDto,
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

const aEstadoPlan = (estado: string): EstadoPlan =>
  (ESTADOS_PLAN as readonly string[]).includes(estado) ? (estado as EstadoPlan) : 'borrador';

export const aPlan = (dto: PlanDto): Plan => ({
  id: dto._id,
  nombre: dto.nombre,
  ...(dto.descripcion ? { descripcion: dto.descripcion } : {}),
  version: dto.version,
  estado: aEstadoPlan(dto.estado),
  ...(dto.publicadoEn ? { publicadoEn: dto.publicadoEn } : {}),
});

/** Un plan del que solo llegó el id (no debería pasar, pero la pantalla no se rompe). */
const planDesconocido = (id: string): Plan => ({ id, nombre: '', version: 0, estado: 'publicado' });

const esPlanDto = (valor: unknown): valor is PlanDto =>
  typeof valor === 'object' && valor !== null && 'nombre' in valor && 'version' in valor;

export const aMateria = (dto: MateriaDto): Materia => {
  const maestroId = idDeRef(dto.maestro);
  return {
    id: dto._id,
    planId: typeof dto.plan === 'string' ? dto.plan : dto.plan._id,
    nombre: dto.nombre,
    ...(dto.descripcion ? { descripcion: dto.descripcion } : {}),
    bloque: dto.bloque,
    ...(maestroId ? { maestroId } : {}),
  };
};

export const aMateriaConMaestro = (dto: MateriaDto): MateriaConMaestro => {
  const materia = aMateria(dto);
  const maestro = typeof dto.maestro === 'object' && dto.maestro !== null ? aResumenUsuario(dto.maestro) : undefined;
  return maestro?.nombre ? { ...materia, maestro } : materia;
};

export const aMateriaEnPlan = (dto: MateriaDto): MateriaEnPlan => ({
  ...aMateria(dto),
  plan: esPlanDto(dto.plan) ? aPlan(dto.plan) : planDesconocido(aMateria(dto).planId),
});

export const aPlanDetallado = (dto: PlanDetalladoDto): PlanDetallado => ({
  ...aPlan(dto),
  materias: (dto.materias ?? []).map(aMateriaConMaestro),
});

const ENTIDADES: EntidadCambio[] = ['plan', 'materia', 'clase', 'examen'];
const ACCIONES: AccionCambio[] = ['crear', 'actualizar', 'eliminar', 'importar', 'publicar', 'nuevaVersion'];

export const aCambio = (dto: CambioDto): CambioPlan => ({
  id: dto._id,
  entidad: (ENTIDADES as string[]).includes(dto.entidad) ? (dto.entidad as EntidadCambio) : 'plan',
  entidadId: dto.entidadId,
  accion: (ACCIONES as string[]).includes(dto.accion) ? (dto.accion as AccionCambio) : 'actualizar',
  autorId: dto.autor,
  fecha: dto.fecha,
  ...(dto.antes !== undefined ? { antes: dto.antes } : {}),
  ...(dto.despues !== undefined ? { despues: dto.despues } : {}),
});

const ESTADOS_SEMANA: EstadoSemana[] = ['completada', 'actual', 'futura'];

const aSemana = (dto: SemanaDto): Semana => ({
  numero: dto.numero,
  inicio: dto.inicio,
  fin: dto.fin,
  estado: (ESTADOS_SEMANA as string[]).includes(dto.estado) ? (dto.estado as EstadoSemana) : 'futura',
  bloque: dto.bloque ?? Math.floor((dto.numero - 1) / 2) + 1,
  semanaDeMateria: dto.semanaDeMateria ?? ((dto.numero - 1) % 2) + 1,
});

export const aGrupo = (dto: GrupoDto): Grupo => ({
  id: dto._id,
  nombre: dto.nombre,
  fechaInicio: dto.fechaInicio,
  plan: esPlanDto(dto.plan) ? aPlan(dto.plan) : planDesconocido(dto.plan._id),
  materias: (dto.materias ?? []).map(aMateriaConMaestro),
  semanaActual: dto.semanaActual ?? 0,
  semanas: (dto.semanas ?? []).map(aSemana),
});

export const aCalificaciones = (dto: CalificacionesGrupoDto): CalificacionesGrupo => ({
  materias: (dto.materias ?? []).map((m) => ({ id: m._id, nombre: m.nombre, bloque: m.bloque })),
  boletas: (dto.boletas ?? []).map((b) => ({
    alumno: aResumenUsuario(b.alumno),
    materias: (b.materias ?? []).map(
      (m): BoletaMateria => ({
        materiaId: m.materia,
        notas: (m.notas ?? []).map((n) => ({ semana: n.semana, numero: n.numero, calificacion: n.calificacion })),
        promedio: m.promedio,
        aprobada: m.aprobada,
        completa: m.completa,
      }),
    ),
    promedioGeneral: b.promedioGeneral ?? 0,
  })),
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
});

export const aExamen = (dto: ExamenDto): Examen => ({
  id: dto._id,
  materiaId: idDeRef(dto.materia),
  semana: dto.semana,
  numero: dto.numero,
  titulo: dto.titulo,
  ...(dto.descripcion ? { descripcion: dto.descripcion } : {}),
  diasExtra: dto.diasExtra ?? 0,
  preguntas: (dto.preguntas ?? []).map((p) => ({
    ...(p._id ? { id: p._id } : {}),
    enunciado: p.enunciado,
    opciones: p.opciones,
    respuestaCorrecta: p.respuestaCorrecta ?? 0,
  })),
  ...(typeof dto.tieneRespuestas === 'boolean' ? { tieneRespuestas: dto.tieneRespuestas } : {}),
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

export const aResumenExamen = (dto: ResumenExamenDto): ResumenExamen => {
  const materia = aResumenUsuario(dto.materia);
  return {
    id: dto._id,
    materia: { id: materia.id, nombre: materia.nombre },
    semana: dto.semana,
    numero: dto.numero,
    semanaDelGrupo: dto.semanaDelGrupo ?? 0,
    titulo: dto.titulo,
    ...(dto.descripcion ? { descripcion: dto.descripcion } : {}),
    totalPreguntas: dto.totalPreguntas ?? 0,
    ventana: aVentana(dto.ventana),
    ...(dto.miIntento !== undefined ? { miIntento: dto.miIntento ? aResultado(dto.miIntento) : null } : {}),
  };
};

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
  ...(typeof dto.respuestaCorrecta === 'number' ? { respuestaCorrecta: dto.respuestaCorrecta } : {}),
  miRespuesta: dto.miRespuesta ?? -1,
  acierto: dto.acierto ?? false,
});

export const aResultadoConRevision = (dto: ResultadoRevisionDto): ResultadoConRevision => ({
  ...aResultado(dto),
  revision: (dto.revision ?? []).map(aPreguntaRevisada),
  ...(dto.ventana ? { ventana: aVentana(dto.ventana) } : {}),
});
