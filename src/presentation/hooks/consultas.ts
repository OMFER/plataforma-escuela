import { useQuery } from '@tanstack/react-query';
import type { Rol } from '../../domain/entities/Usuario';
import { useCasosDeUso } from '../providers/DependenciasContext';

const semanaValida = (materiaId: string, semana: number): boolean =>
  Boolean(materiaId) && Number.isInteger(semana) && semana > 0;

/** Claves de caché centralizadas para poder invalidarlas desde las mutaciones. */
export const claves = {
  misMaterias: ['materias', 'mias'] as const,
  materias: ['materias', 'todas'] as const,
  alumnosMateria: (materiaId: string) => ['materias', materiaId, 'alumnos'] as const,
  contenidoSemana: (materiaId: string, semana: number) => ['contenido', materiaId, semana] as const,
  examenes: ['examenes'] as const,
  examenSemana: (materiaId: string, semana: number) => ['examenes', 'semana', materiaId, semana] as const,
  examen: (id: string) => ['examenes', 'id', id] as const,
  intentos: (examenId: string) => ['examenes', 'intentos', examenId] as const,
  usuarios: (rol?: Rol) => ['usuarios', rol ?? 'todos'] as const,
};

export const useMisMaterias = () => {
  const { obtenerMisMaterias } = useCasosDeUso();
  return useQuery({ queryKey: claves.misMaterias, queryFn: () => obtenerMisMaterias.ejecutar() });
};

export const useMaterias = () => {
  const { listarMaterias } = useCasosDeUso();
  return useQuery({ queryKey: claves.materias, queryFn: () => listarMaterias.ejecutar() });
};

export const useAlumnosMateria = (materiaId: string) => {
  const { obtenerAlumnosMateria } = useCasosDeUso();
  return useQuery({
    queryKey: claves.alumnosMateria(materiaId),
    queryFn: () => obtenerAlumnosMateria.ejecutar(materiaId),
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

export const useExamenSemana = (materiaId: string, semana: number) => {
  const { obtenerExamenSemana } = useCasosDeUso();
  return useQuery({
    queryKey: claves.examenSemana(materiaId, semana),
    queryFn: () => obtenerExamenSemana.ejecutar(materiaId, semana),
    enabled: semanaValida(materiaId, semana),
  });
};

export const useExamen = (id: string) => {
  const { obtenerExamen } = useCasosDeUso();
  return useQuery({ queryKey: claves.examen(id), queryFn: () => obtenerExamen.ejecutar(id) });
};

export const useIntentosExamen = (examenId: string | undefined) => {
  const { obtenerIntentosExamen } = useCasosDeUso();
  return useQuery({
    queryKey: claves.intentos(examenId ?? ''),
    queryFn: () => obtenerIntentosExamen.ejecutar(examenId ?? ''),
    enabled: Boolean(examenId),
  });
};

export const useUsuarios = (rol?: Rol) => {
  const { listarUsuarios } = useCasosDeUso();
  return useQuery({ queryKey: claves.usuarios(rol), queryFn: () => listarUsuarios.ejecutar(rol) });
};
