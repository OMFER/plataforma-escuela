import type { MateriaConMaestro } from './Materia';

export const ESTADOS_PLAN = ['borrador', 'publicado'] as const;
/** Borrador: se arma libremente. Publicado: los grupos lo usan y solo admite correcciones. */
export type EstadoPlan = (typeof ESTADOS_PLAN)[number];

/** Una versión del plan de estudios: igual para todos los grupos que la cursan. */
export interface Plan {
  id: string;
  /** Identifica al plan; sus versiones comparten el nombre. */
  nombre: string;
  descripcion?: string;
  version: number;
  estado: EstadoPlan;
  publicadoEn?: string;
}

export interface PlanDetallado extends Plan {
  /** Por bloque y nombre. */
  materias: MateriaConMaestro[];
}

export interface NuevoPlan {
  nombre: string;
  descripcion?: string;
}

/** Lo que le falta al plan para publicarse; vacío si ya está listo. */
export interface RevisionPlan {
  listo: boolean;
  pendientes: string[];
}

export type EntidadCambio = 'plan' | 'materia' | 'clase' | 'examen';
export type AccionCambio = 'crear' | 'actualizar' | 'eliminar' | 'importar' | 'publicar' | 'nuevaVersion';

/** Registro de la bitácora: quién cambió qué, y cómo estaba antes y cómo quedó. */
export interface CambioPlan {
  id: string;
  entidad: EntidadCambio;
  entidadId: string;
  accion: AccionCambio;
  autorId: string;
  fecha: string;
  antes?: unknown;
  despues?: unknown;
}

/** Cada materia dura dos semanas; las del mismo bloque se cursan al mismo tiempo. */
export const SEMANAS_POR_MATERIA = 2;
export const EXAMENES_POR_SEMANA = 2;
export const MAX_BLOQUES = 12;

export const nombreDePlan = (plan: Pick<Plan, 'nombre' | 'version'>): string => `${plan.nombre} · versión ${plan.version}`;
