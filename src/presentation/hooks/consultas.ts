import { useQuery } from '@tanstack/react-query';
import type { Rol } from '../../domain/entities/Usuario';
import { useCasosDeUso } from '../providers/DependenciasContext';

const semanaValida = (id: string, semana: number): boolean => Boolean(id) && Number.isInteger(semana) && semana > 0;

/**
 * Claves de caché centralizadas para poder invalidarlas desde las mutaciones.
 * Todo lo de un grupo cuelga de `['grupos', grupoId]`, lo de un plan de `['planes', planId]`
 * y lo de una materia de `['materias', materiaId]`: cada uno se refresca con una sola invalidación.
 */
export const claves = {
  grupos: ['grupos'] as const,
  misGrupos: ['grupos', 'mios'] as const,
  todosLosGrupos: ['grupos', 'todos'] as const,
  datosGrupo: (grupoId: string) => ['grupos', grupoId] as const,
  grupo: (grupoId: string) => ['grupos', grupoId, 'detalle'] as const,
  alumnosGrupo: (grupoId: string) => ['grupos', grupoId, 'alumnos'] as const,
  calificaciones: (grupoId: string) => ['grupos', grupoId, 'calificaciones'] as const,
  examenesGrupo: (grupoId: string) => ['grupos', grupoId, 'examenes'] as const,
  examenesSemana: (grupoId: string, materiaId: string, semana: number) =>
    ['grupos', grupoId, 'examenes', 'semana', materiaId, semana] as const,
  examenGrupo: (grupoId: string, examenId: string) => ['grupos', grupoId, 'examenes', 'id', examenId] as const,
  planes: ['planes'] as const,
  listaPlanes: ['planes', 'lista'] as const,
  datosPlan: (planId: string) => ['planes', planId] as const,
  plan: (planId: string) => ['planes', planId, 'detalle'] as const,
  revisionPlan: (planId: string) => ['planes', planId, 'revision'] as const,
  cambiosPlan: (planId: string) => ['planes', planId, 'cambios'] as const,
  materias: ['materias'] as const,
  misMaterias: ['materias', 'mias'] as const,
  datosMateria: (materiaId: string) => ['materias', materiaId] as const,
  materia: (materiaId: string) => ['materias', materiaId, 'detalle'] as const,
  contenidoMateria: (materiaId: string) => ['materias', materiaId, 'contenido'] as const,
  contenidoSemana: (materiaId: string, semana: number) => ['materias', materiaId, 'contenido', semana] as const,
  examenesMateria: (materiaId: string) => ['materias', materiaId, 'examenes'] as const,
  examen: (id: string) => ['examenes', id] as const,
  usuarios: (rol?: Rol) => ['usuarios', rol ?? 'todos'] as const,
};

export const useMisGrupos = () => {
  const { obtenerMisGrupos } = useCasosDeUso();
  return useQuery({ queryKey: claves.misGrupos, queryFn: () => obtenerMisGrupos.ejecutar() });
};

export const useGrupos = () => {
  const { listarGrupos } = useCasosDeUso();
  return useQuery({ queryKey: claves.todosLosGrupos, queryFn: () => listarGrupos.ejecutar() });
};

export const useGrupo = (grupoId: string) => {
  const { obtenerGrupo } = useCasosDeUso();
  return useQuery({ queryKey: claves.grupo(grupoId), queryFn: () => obtenerGrupo.ejecutar(grupoId), enabled: Boolean(grupoId) });
};

export const useAlumnosGrupo = (grupoId: string) => {
  const { obtenerAlumnosGrupo } = useCasosDeUso();
  return useQuery({ queryKey: claves.alumnosGrupo(grupoId), queryFn: () => obtenerAlumnosGrupo.ejecutar(grupoId) });
};

export const useCalificaciones = (grupoId: string) => {
  const { obtenerCalificaciones } = useCasosDeUso();
  return useQuery({
    queryKey: claves.calificaciones(grupoId),
    queryFn: () => obtenerCalificaciones.ejecutar(grupoId),
    enabled: Boolean(grupoId),
  });
};

export const usePlanes = () => {
  const { listarPlanes } = useCasosDeUso();
  return useQuery({ queryKey: claves.listaPlanes, queryFn: () => listarPlanes.ejecutar() });
};

export const usePlan = (planId: string) => {
  const { obtenerPlan } = useCasosDeUso();
  return useQuery({ queryKey: claves.plan(planId), queryFn: () => obtenerPlan.ejecutar(planId), enabled: Boolean(planId) });
};

export const useRevisionPlan = (planId: string, habilitado = true) => {
  const { revisarPlan } = useCasosDeUso();
  return useQuery({
    queryKey: claves.revisionPlan(planId),
    queryFn: () => revisarPlan.ejecutar(planId),
    enabled: Boolean(planId) && habilitado,
  });
};

export const useCambiosPlan = (planId: string, habilitado = true) => {
  const { listarCambiosPlan } = useCasosDeUso();
  return useQuery({
    queryKey: claves.cambiosPlan(planId),
    queryFn: () => listarCambiosPlan.ejecutar(planId),
    enabled: Boolean(planId) && habilitado,
  });
};

export const useMisMaterias = () => {
  const { listarMisMaterias } = useCasosDeUso();
  return useQuery({ queryKey: claves.misMaterias, queryFn: () => listarMisMaterias.ejecutar() });
};

export const useMateria = (materiaId: string) => {
  const { obtenerMateria } = useCasosDeUso();
  return useQuery({
    queryKey: claves.materia(materiaId),
    queryFn: () => obtenerMateria.ejecutar(materiaId),
    enabled: Boolean(materiaId),
  });
};

export const useContenidoMateria = (materiaId: string) => {
  const { listarContenidoMateria } = useCasosDeUso();
  return useQuery({
    queryKey: claves.contenidoMateria(materiaId),
    queryFn: () => listarContenidoMateria.ejecutar(materiaId),
    enabled: Boolean(materiaId),
  });
};

export const useContenidoSemana = (materiaId: string, semana: number) => {
  const { obtenerContenidoSemana } = useCasosDeUso();
  return useQuery({
    queryKey: claves.contenidoSemana(materiaId, semana),
    queryFn: () => obtenerContenidoSemana.ejecutar(materiaId, semana),
    enabled: semanaValida(materiaId, semana),
  });
};

/** Exámenes de la materia con sus respuestas (su maestro o el admin). */
export const useExamenesMateria = (materiaId: string) => {
  const { listarExamenesMateria } = useCasosDeUso();
  return useQuery({
    queryKey: claves.examenesMateria(materiaId),
    queryFn: () => listarExamenesMateria.ejecutar(materiaId),
    enabled: Boolean(materiaId),
  });
};

export const useExamenesSemana = (grupoId: string, materiaId: string, semana: number) => {
  const { obtenerExamenesSemana } = useCasosDeUso();
  return useQuery({
    queryKey: claves.examenesSemana(grupoId, materiaId, semana),
    queryFn: () => obtenerExamenesSemana.ejecutar(grupoId, materiaId, semana),
    enabled: Boolean(grupoId) && semanaValida(materiaId, semana),
  });
};

export const useExamenGrupo = (grupoId: string, examenId: string) => {
  const { obtenerExamenGrupo } = useCasosDeUso();
  return useQuery({
    queryKey: claves.examenGrupo(grupoId, examenId),
    queryFn: () => obtenerExamenGrupo.ejecutar(grupoId, examenId),
    enabled: Boolean(grupoId && examenId),
  });
};

/** Plantilla con respuestas (su maestro o el admin). */
export const useExamen = (examenId: string | undefined) => {
  const { obtenerExamen } = useCasosDeUso();
  return useQuery({
    queryKey: claves.examen(examenId ?? ''),
    queryFn: () => obtenerExamen.ejecutar(examenId ?? ''),
    enabled: Boolean(examenId),
  });
};

export const useUsuarios = (rol?: Rol) => {
  const { listarUsuarios } = useCasosDeUso();
  return useQuery({ queryKey: claves.usuarios(rol), queryFn: () => listarUsuarios.ejecutar(rol) });
};
