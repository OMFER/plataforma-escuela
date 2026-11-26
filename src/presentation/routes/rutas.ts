import type { Rol } from '../../domain/entities/Usuario';

export const rutas = {
  login: '/login',
  inicio: '/',
  admin: '/admin',
  plan: (planId: string) => `/admin/planes/${planId}`,
  /** Semana del grupo; `materiaId` elige cuál de las materias de esa semana se muestra. */
  semana: (grupoId: string, semana: number, materiaId?: string) =>
    `/grupos/${grupoId}/semanas/${semana}${materiaId ? `?materia=${materiaId}` : ''}`,
  examen: (grupoId: string, examenId: string) => `/grupos/${grupoId}/examenes/${examenId}`,
  calificaciones: (grupoId: string) => `/grupos/${grupoId}/calificaciones`,
  /** Contenido y exámenes de una materia (su maestro o el admin). */
  materia: (materiaId: string) => `/materias/${materiaId}`,
  editarContenido: (materiaId: string, semana: number) => `/materias/${materiaId}/semanas/${semana}/contenido`,
  nuevoExamen: (materiaId: string, semana: number, numero: number) =>
    `/materias/${materiaId}/examenes/nuevo?semana=${semana}&numero=${numero}`,
  editarExamen: (materiaId: string, examenId: string) => `/materias/${materiaId}/examenes/${examenId}/editar`,
};

export const inicioPorRol = (rol: Rol): string => (rol === 'admin' ? rutas.admin : rutas.inicio);
