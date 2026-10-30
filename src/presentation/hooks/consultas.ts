import { useQuery } from '@tanstack/react-query';
import type { Rol } from '../../domain/entities/Usuario';
import { useCasosDeUso } from '../providers/DependenciasContext';

const semanaValida = (id: string, semana: number): boolean => Boolean(id) && Number.isInteger(semana) && semana > 0;

/**
 * Claves de caché centralizadas para poder invalidarlas desde las mutaciones.
 * Todo lo de un grupo cuelga de `['grupos', grupoId]`, así se refresca con una sola invalidación.
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
  examenesSemana: (grupoId: string, semana: number) => ['grupos', grupoId, 'examenes', 'semana', semana] as const,
  examenGrupo: (grupoId: string, examenId: string) => ['grupos', grupoId, 'examenes', 'id', examenId] as const,
  intentos: (grupoId: string, examenId: string) => ['grupos', grupoId, 'examenes', 'intentos', examenId] as const,
  materias: ['materias'] as const,
  contenidoSemana: (materiaId: string, semana: number) => ['contenido', materiaId, semana] as const,
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

export const useMaterias = () => {
  const { listarMaterias } = useCasosDeUso();
  return useQuery({ queryKey: claves.materias, queryFn: () => listarMaterias.ejecutar() });
};

export const useContenidoSemana = (materiaId: string, semana: number) => {
  const { obtenerContenidoSemana } = useCasosDeUso();
  return useQuery({
    queryKey: claves.contenidoSemana(materiaId, semana),
    queryFn: () => obtenerContenidoSemana.ejecutar(materiaId, semana),
    enabled: semanaValida(materiaId, semana),
  });
};

export const useExamenesGrupo = (grupoId: string) => {
  const { listarExamenesGrupo } = useCasosDeUso();
  return useQuery({
    queryKey: claves.examenesGrupo(grupoId),
    queryFn: () => listarExamenesGrupo.ejecutar(grupoId),
    enabled: Boolean(grupoId),
  });
};

export const useExamenesSemana = (grupoId: string, semana: number) => {
  const { obtenerExamenesSemana } = useCasosDeUso();
  return useQuery({
    queryKey: claves.examenesSemana(grupoId, semana),
    queryFn: () => obtenerExamenesSemana.ejecutar(grupoId, semana),
    enabled: semanaValida(grupoId, semana),
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

/** Plantilla con respuestas (solo maestro). */
export const useExamen = (examenId: string | undefined) => {
  const { obtenerExamen } = useCasosDeUso();
  return useQuery({
    queryKey: claves.examen(examenId ?? ''),
    queryFn: () => obtenerExamen.ejecutar(examenId ?? ''),
    enabled: Boolean(examenId),
  });
};

export const useIntentosExamen = (grupoId: string, examenId: string | undefined) => {
  const { obtenerIntentosExamen } = useCasosDeUso();
  return useQuery({
    queryKey: claves.intentos(grupoId, examenId ?? ''),
    queryFn: () => obtenerIntentosExamen.ejecutar(grupoId, examenId ?? ''),
    enabled: Boolean(grupoId && examenId),
  });
};

export const useUsuarios = (rol?: Rol) => {
  const { listarUsuarios } = useCasosDeUso();
  return useQuery({ queryKey: claves.usuarios(rol), queryFn: () => listarUsuarios.ejecutar(rol) });
};
