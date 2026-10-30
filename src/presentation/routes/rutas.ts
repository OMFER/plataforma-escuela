import type { Rol } from '../../domain/entities/Usuario';

export const rutas = {
  login: '/login',
  inicio: '/',
  admin: '/admin',
  semana: (materiaId: string, semana: number) => `/materias/${materiaId}/semanas/${semana}`,
  editarContenido: (materiaId: string, semana: number) => `/materias/${materiaId}/semanas/${semana}/contenido`,
  editarExamen: (materiaId: string, semana: number) => `/materias/${materiaId}/semanas/${semana}/examen`,
  examen: (examenId: string) => `/examenes/${examenId}`,
};

export const inicioPorRol = (rol: Rol): string => (rol === 'admin' ? rutas.admin : rutas.inicio);
