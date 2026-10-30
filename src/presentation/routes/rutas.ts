import type { TipoExamen } from '../../domain/entities/Examen';
import type { Rol } from '../../domain/entities/Usuario';

export const rutas = {
  login: '/login',
  inicio: '/',
  admin: '/admin',
  semana: (grupoId: string, semana: number) => `/grupos/${grupoId}/semanas/${semana}`,
  editarContenido: (grupoId: string, semana: number) => `/grupos/${grupoId}/semanas/${semana}/contenido`,
  examen: (grupoId: string, examenId: string) => `/grupos/${grupoId}/examenes/${examenId}`,
  calificaciones: (grupoId: string) => `/grupos/${grupoId}/calificaciones`,
  nuevoExamen: (grupoId: string, tipo: TipoExamen, semana?: number) =>
    `/grupos/${grupoId}/examenes/nuevo?tipo=${tipo}${semana ? `&semana=${semana}` : ''}`,
  editarExamen: (grupoId: string, examenId: string) => `/grupos/${grupoId}/examenes/${examenId}/editar`,
};

export const inicioPorRol = (rol: Rol): string => (rol === 'admin' ? rutas.admin : rutas.inicio);
