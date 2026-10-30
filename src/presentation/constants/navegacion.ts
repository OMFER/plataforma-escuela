import type { Rol } from '../../domain/entities/Usuario';
import { rutas } from '../routes/rutas';

export interface ElementoNavegacion {
  path: string;
  label: string;
  icon: string;
}

const NAVEGACION: Record<Rol, ElementoNavegacion[]> = {
  alumno: [{ path: rutas.inicio, label: 'Mis materias', icon: 'calendar_month' }],
  maestro: [{ path: rutas.inicio, label: 'Mis grupos', icon: 'calendar_month' }],
  admin: [{ path: rutas.admin, label: 'Administración', icon: 'admin_panel_settings' }],
};

export const navegacionPorRol = (rol: Rol): ElementoNavegacion[] => NAVEGACION[rol];
